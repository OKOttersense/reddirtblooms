/**
 * Harvest Router
 * Admin-only procedures for managing weekly harvest listings.
 * Florists see published listings via the floristPortal router.
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, and } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { harvestListings, harvestOrders, harvestOrderItems, floristAccounts, bloomSubscribers } from "../../drizzle/schema";
import { storagePut } from "../storage";
import { notifyOwner } from "../_core/notification";
import { ENV } from "../_core/env";
import { notifyHarvestUpdate, notifyOrderUpdate } from "../realtime";

// ── helpers ───────────────────────────────────────────────────────────────────

function adminOnly(role: string) {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required." });
  }
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });
  return db;
}

// ── router ────────────────────────────────────────────────────────────────────

export const harvestRouter = router({
  // ── Public: florists read published listings ──────────────────────────────

  /** Get all currently published harvest listings */
  getPublished: publicProcedure.query(async () => {
    const db = await requireDb();
    return db
      .select()
      .from(harvestListings)
      .where(eq(harvestListings.isPublished, true))
      .orderBy(desc(harvestListings.publishedAt));
  }),

  // ── Admin: manage listings ────────────────────────────────────────────────

  /** Get all listings (admin view, including unpublished) */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    adminOnly(ctx.user.role);
    const db = await requireDb();
    return db.select().from(harvestListings).orderBy(desc(harvestListings.createdAt));
  }),

  /** Create a new harvest listing with optional photo upload */
  create: protectedProcedure
    .input(
      z.object({
        variety: z.string().min(1),
        color: z.string().optional(),
        description: z.string().optional(),
        pricePerBunch: z.number().nonnegative(),
        quantityAvailable: z.number().int().nonnegative(),
        season: z.string().optional(),
        // Pricing tier for farm-direct bunch model
        pricingTier: z.enum(["premium", "specialty", "focal"]).optional(),
        focalPrice: z.number().nonnegative().optional(),
        // Base64-encoded image data (optional — can upload later)
        imageBase64: z.string().optional(),
        imageMimeType: z.string().optional(),
        imageFileName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();

      let imageKey: string | undefined;
      let imageUrl: string | undefined;

      if (input.imageBase64 && input.imageMimeType) {
        const buffer = Buffer.from(input.imageBase64, "base64");
        const fileName = input.imageFileName ?? `harvest-${Date.now()}.jpg`;
        const key = `harvest/${Date.now()}-${fileName}`;
        const result = await storagePut(key, buffer, input.imageMimeType);
        imageKey = result.key;
        imageUrl = result.url;
      }

      const tier = input.pricingTier ?? "premium";
      const tierDefaultPrice = tier === "premium" ? 5 : tier === "specialty" ? 9 : (input.focalPrice ?? 0);
      const effectivePrice = input.pricePerBunch > 0 ? input.pricePerBunch : tierDefaultPrice;

      const [inserted] = await db
        .insert(harvestListings)
        .values({
          variety: input.variety,
          color: input.color ?? "Mixed",
          description: input.description,
          pricePerBunch: effectivePrice.toFixed(2),
          pricingTier: tier,
          focalPrice: input.focalPrice !== undefined ? input.focalPrice.toFixed(2) : undefined,
          quantityAvailable: input.quantityAvailable,
          season: input.season ?? new Date().getFullYear().toString(),
          imageKey,
          imageUrl,
          isPublished: false,
        })
        .$returningId();

      // Notify all connected florist clients that the board changed
      notifyHarvestUpdate();
      return { success: true, id: inserted.id };
    }),

  /** Update an existing listing */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        variety: z.string().min(1).optional(),
        color: z.string().optional(),
        description: z.string().optional(),
        pricePerBunch: z.number().nonnegative().optional(),
        quantityAvailable: z.number().int().nonnegative().optional(),
        season: z.string().optional(),
        pricingTier: z.enum(["premium", "specialty", "focal"]).optional(),
        focalPrice: z.number().nonnegative().optional(),
        imageBase64: z.string().optional(),
        imageMimeType: z.string().optional(),
        imageFileName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();

      const updates: Record<string, unknown> = {};
      if (input.variety !== undefined) updates.variety = input.variety;
      if (input.color !== undefined) updates.color = input.color;
      if (input.description !== undefined) updates.description = input.description;
      if (input.pricePerBunch !== undefined) updates.pricePerBunch = input.pricePerBunch.toFixed(2);
      if (input.quantityAvailable !== undefined) updates.quantityAvailable = input.quantityAvailable;
      if (input.season !== undefined) updates.season = input.season;
      if (input.pricingTier !== undefined) updates.pricingTier = input.pricingTier;
      if (input.focalPrice !== undefined) updates.focalPrice = input.focalPrice.toFixed(2);

      if (input.imageBase64 && input.imageMimeType) {
        const buffer = Buffer.from(input.imageBase64, "base64");
        const fileName = input.imageFileName ?? `harvest-${Date.now()}.jpg`;
        const key = `harvest/${Date.now()}-${fileName}`;
        const result = await storagePut(key, buffer, input.imageMimeType);
        updates.imageKey = result.key;
        updates.imageUrl = result.url;
      }

      if (Object.keys(updates).length > 0) {
        await db
          .update(harvestListings)
          .set(updates)
          .where(eq(harvestListings.id, input.id));
      }

      return { success: true };
    }),

  /** Delete a listing */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();
      await db.delete(harvestListings).where(eq(harvestListings.id, input.id));
      // Notify all connected florist clients that the board changed
      notifyHarvestUpdate();
      return { success: true };
    }),

  /** Publish or unpublish a listing */
  setPublished: protectedProcedure
    .input(z.object({ id: z.number(), published: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();
      await db
        .update(harvestListings)
        .set({
          isPublished: input.published,
          publishedAt: input.published ? new Date() : undefined,
        })
        .where(eq(harvestListings.id, input.id));
      // Notify all connected florist clients that the board changed
      notifyHarvestUpdate();
      return { success: true };
    }),

  /** Mark a listing as sold out (or reopen it) */
  markSoldOut: protectedProcedure
    .input(z.object({ id: z.number(), soldOut: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();
      await db
        .update(harvestListings)
        .set({ isSoldOut: input.soldOut })
        .where(eq(harvestListings.id, input.id));
      notifyHarvestUpdate();
      return { success: true };
    }),

  /**
   * Send a harvest notification to all active Bloom Watch subscribers.
   * Returns count of subscribers notified.
   */
  sendHarvestNotification: protectedProcedure
    .input(z.object({ message: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();
      // Fetch active subscribers
      const subscribers = await db
        .select({ id: bloomSubscribers.id, email: bloomSubscribers.email, name: bloomSubscribers.name })
        .from(bloomSubscribers)
        .where(eq(bloomSubscribers.active, true));
      // Fetch published, non-sold-out listings for the summary
      const listings = await db
        .select()
        .from(harvestListings)
        .where(eq(harvestListings.isPublished, true))
        .orderBy(desc(harvestListings.publishedAt));
      const availableListings = listings.filter((l) => !l.isSoldOut);
      const listingSummary = availableListings
        .map((l) => `\u2022 ${l.variety} \u2014 $${l.pricePerBunch}/bunch \u2014 ${l.quantityAvailable - l.quantitySold} available`)
        .join("\n");
      const customMessage = input.message ? `\n\n${input.message}` : "";
      // Notify owner with subscriber summary (GHL handles the actual email sends)
      await notifyOwner({
        title: `\ud83c\udf38 Harvest Notification Sent \u2014 ${subscribers.length} Bloom Watch subscribers`,
        content: `A harvest notification has been triggered for ${subscribers.length} Bloom Watch subscribers.${customMessage}\n\n**Available listings:**\n${listingSummary || "(none published)"}\n\n**Subscriber emails:**\n${subscribers.map((s) => s.email).join(", ")}`,
      });
      return {
        success: true,
        subscribersNotified: subscribers.length,
        listingsAvailable: availableListings.length,
      };
    }),

  /**
   * Publish all staged listings and trigger harvest email blast to approved florists.
   * Returns the count of florists notified.
   */
  publishAndNotify: protectedProcedure
    .input(z.object({ listingIds: z.array(z.number()) }))
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();

      // Publish all selected listings
      for (const id of input.listingIds) {
        await db
          .update(harvestListings)
          .set({ isPublished: true, publishedAt: new Date() })
          .where(eq(harvestListings.id, id));
      }

      // Fetch the published listings for the email
      const listings = await db
        .select()
        .from(harvestListings)
        .where(eq(harvestListings.isPublished, true))
        .orderBy(desc(harvestListings.publishedAt));

      // Fetch all approved florists
      const florists = await db
        .select({ id: floristAccounts.id, email: floristAccounts.email, contactName: floristAccounts.contactName, businessName: floristAccounts.businessName })
        .from(floristAccounts)
        .where(eq(floristAccounts.status, "approved"));

      // Build email content summary for owner notification
      const listingSummary = listings
        .map((l) => `• ${l.variety} — $${l.pricePerBunch}/bunch — ${l.quantityAvailable - l.quantitySold} bunches available`)
        .join("\n");

      const floristEmails = florists.map((f) => f.email).join(", ");

      // Notify owner with harvest summary and florist list
      await notifyOwner({
        title: `🌸 Harvest Published — ${listings.length} varieties, ${florists.length} florists notified`,
        content: `This week's harvest has been published and florists have been notified.\n\n**Listings:**\n${listingSummary}\n\n**Florists notified (${florists.length}):**\n${floristEmails}\n\nFlorists can order at: https://www.reddirtblooms.ai/florist-portal`,
      });

      // Broadcast real-time harvest update to all connected florist clients
      notifyHarvestUpdate();

      return {
        success: true,
        listingsPublished: listings.length,
        floristsNotified: florists.length,
        floristEmails: florists.map((f) => ({ email: f.email, name: f.contactName, business: f.businessName })),
      };
    }),

  // ── Admin: view orders ────────────────────────────────────────────────────

  /** Get all wholesale orders (admin view) */
  getOrders: protectedProcedure.query(async ({ ctx }) => {
    adminOnly(ctx.user.role);
    const db = await requireDb();
    const orders = await db
      .select({
        id: harvestOrders.id,
        floristId: harvestOrders.floristId,
        status: harvestOrders.status,
        paymentMethod: harvestOrders.paymentMethod,
        totalAmountCents: harvestOrders.totalAmountCents,
        notes: harvestOrders.notes,
        createdAt: harvestOrders.createdAt,
        floristEmail: floristAccounts.email,
        floristBusiness: floristAccounts.businessName,
        floristContact: floristAccounts.contactName,
      })
      .from(harvestOrders)
      .leftJoin(floristAccounts, eq(harvestOrders.floristId, floristAccounts.id))
      .orderBy(desc(harvestOrders.createdAt));
    return orders;
  }),

  /** Update order status (admin) */
  updateOrderStatus: protectedProcedure
    .input(z.object({ orderId: z.number(), status: z.enum(["pending", "confirmed", "invoiced", "paid", "cancelled"]) }))
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();

      // Fetch the order's floristId before updating so we can notify the right client
      const [order] = await db
        .select({ floristId: harvestOrders.floristId })
        .from(harvestOrders)
        .where(eq(harvestOrders.id, input.orderId))
        .limit(1);

      await db
        .update(harvestOrders)
        .set({ status: input.status })
        .where(eq(harvestOrders.id, input.orderId));

      // Notify the specific florist's SSE connection about their order update
      if (order?.floristId != null) {
        notifyOrderUpdate(order.floristId);
      }

      return { success: true };
    }),
});
