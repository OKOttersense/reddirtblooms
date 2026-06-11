/**
 * Florist Portal Router
 * Procedures for approved florists to place wholesale orders.
 * Uses florist JWT session (not Manus OAuth).
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, inArray } from "drizzle-orm";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { harvestListings, harvestOrders, harvestOrderItems, floristAccounts, floristSuggestions } from "../../drizzle/schema";
import { getFloristFromRequest } from "./floristAuth";
import { notifyOwner } from "../_core/notification";
import Stripe from "stripe";

// Lazy-init: don't crash at import time if STRIPE_SECRET_KEY is missing
// (this was breaking unrelated test suites that import this module).
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("STRIPE_SECRET_KEY is not set — cannot process payments.");
    }
    _stripe = new Stripe(key, { apiVersion: "2025-04-30" as any });
  }
  return _stripe;
}

// ── helper: require approved florist session ──────────────────────────────────

async function requireApprovedFlorist(req: any) {
  const florist = await getFloristFromRequest(req);
  if (!florist) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Please log in to your florist account." });
  }
  if (florist.status !== "approved") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Your account is pending approval." });
  }
  return florist;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });
  return db;
}

// ── router ────────────────────────────────────────────────────────────────────

export const floristPortalRouter = router({
  /** Get current florist session (used by frontend to check auth state) */
  me: publicProcedure.query(async ({ ctx }) => {
    const florist = await getFloristFromRequest(ctx.req);
    return florist
      ? {
          id: florist.id,
          email: florist.email,
          businessName: florist.businessName,
          contactName: florist.contactName,
          status: florist.status,
        }
      : null;
  }),

  /** Get published harvest listings for the florist board */
  getHarvestBoard: publicProcedure.query(async ({ ctx }) => {
    await requireApprovedFlorist(ctx.req);
    const db = await requireDb();
    return db
      .select()
      .from(harvestListings)
      .where(eq(harvestListings.isPublished, true))
      .orderBy(desc(harvestListings.publishedAt));
  }),

  /** Create a Stripe checkout session for a cart of items */
  checkout: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            listingId: z.number(),
            quantity: z.number().int().positive(),
          })
        ),
        origin: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const florist = await requireApprovedFlorist(ctx.req);
      const db = await requireDb();

      // Validate all listings exist and have enough stock
      const listingIds = input.items.map((i) => i.listingId);
      const listings = await db
        .select()
        .from(harvestListings)
        .where(and(eq(harvestListings.isPublished, true), inArray(harvestListings.id, listingIds)));

      const listingMap = new Map(listings.map((l) => [l.id, l]));

      for (const item of input.items) {
        const listing = listingMap.get(item.listingId);
        if (!listing) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Listing ${item.listingId} not found.` });
        }
        const remaining = listing.quantityAvailable - listing.quantitySold;
        if (item.quantity > remaining) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Only ${remaining} bunches of ${listing.variety} available.`,
          });
        }
      }

      // Build Stripe line items
      const lineItems = input.items.map((item) => {
        const listing = listingMap.get(item.listingId)!;
        const priceCents = Math.round(parseFloat(listing.pricePerBunch as any) * 100);
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${listing.variety} — Wholesale Bunch`,
              description: listing.description ?? undefined,
              images: listing.imageUrl ? [`${input.origin}${listing.imageUrl}`] : undefined,
            },
            unit_amount: priceCents,
          },
          quantity: item.quantity,
        };
      });

      // Create pending order record
      const totalCents = input.items.reduce((sum, item) => {
        const listing = listingMap.get(item.listingId)!;
        return sum + Math.round(parseFloat(listing.pricePerBunch as any) * 100) * item.quantity;
      }, 0);

      const [newOrder] = await db
        .insert(harvestOrders)
        .values({
          floristId: florist.id,
          status: "pending",
          paymentMethod: "stripe",
          totalAmountCents: totalCents,
        })
        .$returningId();

      // Insert order items
      await db.insert(harvestOrderItems).values(
        input.items.map((item) => ({
          orderId: newOrder.id,
          listingId: item.listingId,
          quantity: item.quantity,
          pricePerBunchCents: Math.round(parseFloat(listingMap.get(item.listingId)!.pricePerBunch as any) * 100),
        }))
      );

      // Create Stripe checkout session
      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        customer_email: florist.email,
        metadata: {
          floristId: florist.id.toString(),
          floristBusiness: florist.businessName,
          // Include contact name so the webhook can populate GHL firstName/lastName.
          // Florist portal sessions don't go through the public checkout form, so
          // customer_details.name may be null — metadata is the fallback.
          customer_name: florist.contactName || "",
          orderId: newOrder.id.toString(),
          orderType: "wholesale",
        },
        success_url: `${input.origin}/florist-portal?order=success&orderId=${newOrder.id}`,
        cancel_url: `${input.origin}/florist-portal?order=cancelled`,
      });

      // Save session ID to order
      await db
        .update(harvestOrders)
        .set({ stripeSessionId: session.id })
        .where(eq(harvestOrders.id, newOrder.id));

      return { checkoutUrl: session.url, orderId: newOrder.id };
    }),

  /** Request invoice instead of Stripe payment */
  requestInvoice: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            listingId: z.number(),
            quantity: z.number().int().positive(),
          })
        ),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const florist = await requireApprovedFlorist(ctx.req);
      const db = await requireDb();

      // Validate listings
      const listingIds = input.items.map((i) => i.listingId);
      const listings = await db
        .select()
        .from(harvestListings)
        .where(and(eq(harvestListings.isPublished, true), inArray(harvestListings.id, listingIds)));

      const listingMap = new Map(listings.map((l) => [l.id, l]));

      const totalCents = input.items.reduce((sum, item) => {
        const listing = listingMap.get(item.listingId);
        if (!listing) return sum;
        return sum + Math.round(parseFloat(listing.pricePerBunch as any) * 100) * item.quantity;
      }, 0);

      // Create order record
      const [newOrder] = await db
        .insert(harvestOrders)
        .values({
          floristId: florist.id,
          status: "invoiced",
          paymentMethod: "invoice",
          totalAmountCents: totalCents,
          notes: input.notes,
        })
        .$returningId();

      await db.insert(harvestOrderItems).values(
        input.items.map((item) => ({
          orderId: newOrder.id,
          listingId: item.listingId,
          quantity: item.quantity,
          pricePerBunchCents: Math.round(parseFloat(listingMap.get(item.listingId)!.pricePerBunch as any) * 100),
        }))
      );

      // Reserve inventory
      for (const item of input.items) {
        const listing = listingMap.get(item.listingId);
        if (listing) {
          await db
            .update(harvestListings)
            .set({ quantitySold: listing.quantitySold + item.quantity })
            .where(eq(harvestListings.id, item.listingId));
        }
      }

      // Build order summary for owner notification
      const itemSummary = input.items
        .map((item) => {
          const listing = listingMap.get(item.listingId);
          return listing
            ? `• ${listing.variety} × ${item.quantity} bunches @ $${listing.pricePerBunch}/bunch`
            : `• Listing ${item.listingId} × ${item.quantity}`;
        })
        .join("\n");

      await notifyOwner({
        title: `📋 Invoice Request — ${florist.businessName}`,
        content: `${florist.contactName} (${florist.businessName}) has requested an invoice.\n\nEmail: ${florist.email}\nTotal: $${(totalCents / 100).toFixed(2)}\n\nOrder #${newOrder.id}:\n${itemSummary}\n\nNotes: ${input.notes ?? "none"}\n\nReview at /admin/harvest`,
      });

      return {
        success: true,
        orderId: newOrder.id,
        message: "Invoice request submitted! Lance will send your invoice within 1 business day.",
      };
    }),

  /** Get current florist's order history */
  myOrders: publicProcedure.query(async ({ ctx }) => {
    const florist = await requireApprovedFlorist(ctx.req);
    const db = await requireDb();
    return db
      .select()
      .from(harvestOrders)
      .where(eq(harvestOrders.floristId, florist.id))
      .orderBy(desc(harvestOrders.createdAt));
  }),

  /** Submit a suggestion, variety request, or feedback */
  submitSuggestion: publicProcedure
    .input(
      z.object({
        message: z.string().min(5, "Please write at least 5 characters.").max(2000),
        category: z.enum(["variety-request", "feedback", "special-order", "general"]).default("general"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const florist = await requireApprovedFlorist(ctx.req);
      const db = await requireDb();
      await db.insert(floristSuggestions).values({
        floristId: florist.id,
        floristEmail: florist.email,
        floristBusinessName: florist.businessName,
        message: input.message,
        category: input.category,
        status: "new",
      });
      await notifyOwner({
        title: `💡 Florist Suggestion — ${florist.businessName}`,
        content: `${florist.contactName} (${florist.email}) submitted a ${input.category}:\n\n"${input.message}"`,
      });
      return { success: true };
    }),

  /** Get current florist's own suggestions */
  mySuggestions: publicProcedure.query(async ({ ctx }) => {
    const florist = await requireApprovedFlorist(ctx.req);
    const db = await requireDb();
    return db
      .select()
      .from(floristSuggestions)
      .where(eq(floristSuggestions.floristId, florist.id))
      .orderBy(desc(floristSuggestions.createdAt));
  }),
});
