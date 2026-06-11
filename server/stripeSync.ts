/**
 * Red Dirt Blooms — Stripe Sync System
 * Handles automated product creation, naming logic, and syncing to Stripe
 *
 * Naming convention: `{Variety}-{Color}-{StemSize}Stem-{Tier} Bunch`
 * Example: `Gaura-Pink-2Stem-Premium Bunch`
 */

import Stripe from "stripe";
import type { Stripe as StripeType } from "stripe";
import { PricingTier, StemSize, TIER_PRICES, TIER_LABELS } from "./stripeProducts";

// Lazy-init: don't crash at import time if STRIPE_SECRET_KEY is missing
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set — cannot process payments.");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export interface HarvestListingForSync {
  id: string;
  variety: string;
  color: string;
  pricingTier: PricingTier;
  price2Stem: number; // in cents
  price4Stem: number;
  price6Stem: number;
  focalPrice?: number; // in cents, for focal tier
}

/**
 * Generate Stripe product name using naming convention
 * Format: `{Variety}-{Color}-{StemSize}Stem-{Tier} Bunch`
 */
export function generateStripeProductName(
  variety: string,
  color: string,
  stemSize: StemSize,
  tier: PricingTier
): string {
  const tierLabel = TIER_LABELS[tier];
  return `${variety}-${color}-${stemSize}Stem-${tierLabel} Bunch`;
}

/**
 * Get price for a specific stem size based on tier
 */
export function getPriceForStemSize(
  tier: PricingTier,
  stemSize: StemSize,
  focalPrice?: number
): number {
  if (tier === "focal") {
    return focalPrice ?? 1; // $0.01 placeholder if not provided
  }
  return TIER_PRICES[tier][stemSize];
}

/**
 * Create or update a Stripe product for a harvest listing
 * Returns the Stripe product ID and price ID
 */
export async function syncHarvestListingToStripe(
  listing: HarvestListingForSync,
  stemSize: StemSize
): Promise<{ productId: string; priceId: string }> {
  const productName = generateStripeProductName(
    listing.variety,
    listing.color,
    stemSize,
    listing.pricingTier
  );

  const priceCents = getPriceForStemSize(
    listing.pricingTier,
    stemSize,
    listing.focalPrice
  );

  // Metadata for tracking
  const metadata = {
    listingId: listing.id,
    variety: listing.variety,
    color: listing.color,
    tier: listing.pricingTier,
    stemSize: stemSize.toString(),
  };

  try {
    // Create product
    const product = await getStripe().products.create({
      name: productName,
      description: `${stemSize}-stem bunch of ${listing.variety} (${listing.pricingTier} tier)`,
      metadata,
      type: "good",
    });

    // Create price
    const price = await getStripe().prices.create({
      product: product.id,
      unit_amount: priceCents,
      currency: "usd",
      metadata,
    });

    return {
      productId: product.id,
      priceId: price.id,
    };
  } catch (error) {
    console.error(`[Stripe Sync] Error creating product for ${productName}:`, error);
    throw error;
  }
}

/**
 * Bulk sync all harvest listings to Stripe
 * Creates products for 2-stem, 4-stem, and 6-stem sizes
 */
export async function bulkSyncToStripe(
  listings: HarvestListingForSync[]
): Promise<
  Array<{
    listingId: string;
    variety: string;
    stemSize: StemSize;
    productId: string;
    priceId: string;
    status: "success" | "error";
    error?: string;
  }>
> {
  const results = [];
  const stemSizes: StemSize[] = [2, 4, 6];

  for (const listing of listings) {
    for (const stemSize of stemSizes) {
      try {
        const { productId, priceId } = await syncHarvestListingToStripe(
          listing,
          stemSize
        );

        results.push({
          listingId: listing.id,
          variety: listing.variety,
          stemSize,
          productId,
          priceId,
          status: "success" as const,
        });
      } catch (error) {
        results.push({
          listingId: listing.id,
          variety: listing.variety,
          stemSize,
          productId: "",
          priceId: "",
          status: "error" as const,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  return results;
}

/**
 * Get all Stripe products with our metadata
 */
export async function getRedDirtBloomsProducts(): Promise<Stripe.Product[]> {
  const products: Stripe.Product[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const page = await getStripe().products.list({
      limit: 100,
      starting_after: startingAfter,
      expand: ["data.default_price"],
    });

    // Filter to only our products (those with our metadata)
    const ourProducts = page.data.filter(
      (p) => p.metadata && p.metadata.listingId
    );
    products.push(...ourProducts);

    hasMore = page.has_more;
    if (ourProducts.length > 0) {
      startingAfter = ourProducts[ourProducts.length - 1].id;
    }
  }

  return products;
}
