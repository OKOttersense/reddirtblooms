/**
 * Stripe Sync Router
 * Admin procedures for syncing harvest listings to Stripe and managing product catalog
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { harvestListings } from "../../drizzle/schema";
import {
  syncHarvestListingToStripe,
  bulkSyncToStripe,
  generateStripeProductName,
  getPriceForStemSize,
} from "../stripeSync";
import { notifyOwner } from "../_core/notification";

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

export const stripeSyncRouter = router({
  /**
   * Sync a single harvest listing to Stripe
   * Creates/updates Stripe products for 2-stem, 4-stem, and 6-stem sizes
   * Stores product/price IDs in the harvest_listings record
   */
  syncListing: protectedProcedure
    .input(z.object({ listingId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();

      // Fetch the listing
      const listing = await db
        .select()
        .from(harvestListings)
        .where(eq(harvestListings.id, input.listingId))
        .then((rows) => rows[0]);

      if (!listing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Listing not found" });
      }

      const stemSizes = [2, 4, 6] as const;
      const results: Record<string, string> = {};

      try {
        for (const stemSize of stemSizes) {
          const { productId, priceId } = await syncHarvestListingToStripe(
            {
              id: listing.id.toString(),
              variety: listing.variety,
              color: listing.color || "Mixed",
              pricingTier: (listing.pricingTier as "premium" | "specialty" | "focal") || "premium",
              price2Stem: parseInt(listing.price2Stem || "0") * 100,
              price4Stem: parseInt(listing.price4Stem || "0") * 100,
              price6Stem: parseInt(listing.price6Stem || "0") * 100,
              focalPrice: listing.focalPrice ? parseInt(listing.focalPrice) * 100 : undefined,
            },
            stemSize
          );

          results[`product${stemSize}`] = productId;
          results[`price${stemSize}`] = priceId;
        }

        // Update listing with Stripe IDs
        await db
          .update(harvestListings)
          .set({
            stripeProductId2Stem: results.product2,
            stripeProductId4Stem: results.product4,
            stripeProductId6Stem: results.product6,
            stripePriceId2Stem: results.price2,
            stripePriceId4Stem: results.price4,
            stripePriceId6Stem: results.price6,
            syncedToStripe: true,
            lastSyncedAt: new Date(),
          })
          .where(eq(harvestListings.id, input.listingId));

        await notifyOwner({
          title: `✅ Stripe Sync Complete — ${listing.variety}`,
          content: `Successfully synced ${listing.variety} (${listing.color}) to Stripe.\n\n2-Stem: ${results.product2}\n4-Stem: ${results.product4}\n6-Stem: ${results.product6}`,
        });

        return { success: true, results };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        await notifyOwner({
          title: `❌ Stripe Sync Failed — ${listing.variety}`,
          content: `Error: ${errorMsg}`,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Stripe sync failed: ${errorMsg}`,
        });
      }
    }),

  /**
   * Bulk sync all unpublished listings to Stripe
   * Useful for batch operations
   */
  bulkSync: protectedProcedure
    .input(z.object({ listingIds: z.array(z.number()).optional() }))
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();

      // Fetch listings to sync
      let listings = await db.select().from(harvestListings);
      if (input.listingIds && input.listingIds.length > 0) {
        listings = listings.filter((l) => input.listingIds!.includes(l.id));
      }

      const syncListings = listings.map((l) => ({
        id: l.id.toString(),
        variety: l.variety,
        color: l.color || "Mixed",
        pricingTier: (l.pricingTier as "premium" | "specialty" | "focal") || "premium",
        price2Stem: parseInt(l.price2Stem || "0") * 100,
        price4Stem: parseInt(l.price4Stem || "0") * 100,
        price6Stem: parseInt(l.price6Stem || "0") * 100,
        focalPrice: l.focalPrice ? parseInt(l.focalPrice) * 100 : undefined,
      }));

      try {
        const results = await bulkSyncToStripe(syncListings);

        // Update each listing with results
        for (const result of results) {
          if (result.status === "success") {
            const listingId = parseInt(result.listingId);
            const key = `stripePriceId${result.stemSize}Stem` as
              | "stripePriceId2Stem"
              | "stripePriceId4Stem"
              | "stripePriceId6Stem";
            const productKey = `stripeProductId${result.stemSize}Stem` as
              | "stripeProductId2Stem"
              | "stripeProductId4Stem"
              | "stripeProductId6Stem";

            await db
              .update(harvestListings)
              .set({
                [key]: result.priceId,
                [productKey]: result.productId,
                syncedToStripe: true,
                lastSyncedAt: new Date(),
              })
              .where(eq(harvestListings.id, listingId));
          }
        }

        const successCount = results.filter((r) => r.status === "success").length;
        const errorCount = results.filter((r) => r.status === "error").length;

        await notifyOwner({
          title: `📊 Bulk Stripe Sync Complete`,
          content: `Synced ${listings.length} listings.\nSuccess: ${successCount}\nErrors: ${errorCount}`,
        });

        return { success: true, results, successCount, errorCount };
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Bulk sync failed: ${errorMsg}`,
        });
      }
    }),

  /**
   * Get sync status for all listings
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    adminOnly(ctx.user.role);
    const db = await requireDb();

    const listings = await db.select().from(harvestListings);
    const synced = listings.filter((l) => l.syncedToStripe).length;
    const unsynced = listings.length - synced;

    return {
      total: listings.length,
      synced,
      unsynced,
      listings: listings.map((l) => ({
        id: l.id,
        variety: l.variety,
        color: l.color,
        pricingTier: l.pricingTier,
        syncedToStripe: l.syncedToStripe,
        lastSyncedAt: l.lastSyncedAt,
      })),
    };
  }),
});
