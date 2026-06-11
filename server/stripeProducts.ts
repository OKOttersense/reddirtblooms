/**
 * Red Dirt Blooms — Stripe Product Catalog
 * Farm-direct bunch model: sell individual flower bunches by variety in 2/4/6 stem sizes.
 *
 * Pricing tiers:
 *   Premium:   2-stem $5 / 4-stem $9  / 6-stem $12
 *   Specialty: 2-stem $9 / 4-stem $15 / 6-stem $21
 *   Focal:     market price (focalPrice field on listing)
 *
 * Stripe products are generic per-size; variety/tier info goes into metadata.
 */

export type ProductType = "bunch" | "subscription";
export type PricingTier = "premium" | "specialty" | "focal";
export type StemSize = 2 | 4 | 6;

export interface RDBProduct {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  type: ProductType;
  stripePriceId: string;
  isSubscription: boolean;
  subscriptionInterval?: "week" | "month";
}

// Tier pricing table (cents)
export const TIER_PRICES: Record<PricingTier, Record<StemSize, number>> = {
  premium: { 2: 500, 4: 900, 6: 1200 },
  specialty: { 2: 900, 4: 1500, 6: 2100 },
  focal: { 2: 0, 4: 0, 6: 0 }, // focal uses per-listing focalPrice
};

// Human-readable tier labels
export const TIER_LABELS: Record<PricingTier, string> = {
  premium: "Premium",
  specialty: "Specialty",
  focal: "Focal / Single",
};

/**
 * Get the price in cents for a given tier + stem size.
 * For focal flowers, pass the per-listing focalPrice (in cents).
 */
export function getBunchPrice(
  tier: PricingTier,
  stemSize: StemSize,
  focalPriceCents?: number
): number {
  if (tier === "focal") return focalPriceCents ?? 0;
  return TIER_PRICES[tier][stemSize];
}

/**
 * Stripe products — one per stem size for each tier.
 * Price IDs are stored as env vars and created via create-stripe-products.mjs.
 */
export function getProducts(): RDBProduct[] {
  return [
    // ── PREMIUM BUNCHES ──
    {
      id: "premium-2stem",
      name: "Premium Bunch — 2 Stems",
      description: "2-stem bunch of a premium farm-grown variety.",
      priceCents: 500,
      type: "bunch",
      stripePriceId: process.env.STRIPE_PRICE_PREMIUM_2STEM || "",
      isSubscription: false,
    },
    {
      id: "premium-4stem",
      name: "Premium Bunch — 4 Stems",
      description: "4-stem bunch of a premium farm-grown variety.",
      priceCents: 900,
      type: "bunch",
      stripePriceId: process.env.STRIPE_PRICE_PREMIUM_4STEM || "",
      isSubscription: false,
    },
    {
      id: "premium-6stem",
      name: "Premium Bunch — 6 Stems",
      description: "6-stem bunch of a premium farm-grown variety.",
      priceCents: 1200,
      type: "bunch",
      stripePriceId: process.env.STRIPE_PRICE_PREMIUM_6STEM || "",
      isSubscription: false,
    },
    // ── SPECIALTY BUNCHES ──
    {
      id: "specialty-2stem",
      name: "Specialty Bunch — 2 Stems",
      description: "2-stem bunch of a specialty farm-grown variety.",
      priceCents: 900,
      type: "bunch",
      stripePriceId: process.env.STRIPE_PRICE_SPECIALTY_2STEM || "",
      isSubscription: false,
    },
    {
      id: "specialty-4stem",
      name: "Specialty Bunch — 4 Stems",
      description: "4-stem bunch of a specialty farm-grown variety.",
      priceCents: 1500,
      type: "bunch",
      stripePriceId: process.env.STRIPE_PRICE_SPECIALTY_4STEM || "",
      isSubscription: false,
    },
    {
      id: "specialty-6stem",
      name: "Specialty Bunch — 6 Stems",
      description: "6-stem bunch of a specialty farm-grown variety.",
      priceCents: 2100,
      type: "bunch",
      stripePriceId: process.env.STRIPE_PRICE_SPECIALTY_6STEM || "",
      isSubscription: false,
    },
    // ── BLOOM SHARE SUBSCRIPTIONS ──
    {
      id: "weekly-bloom-share",
      name: "Weekly Bloom Share — 12 Weeks",
      description: "12 weekly bouquets from June through October.",
      priceCents: 39600,
      type: "subscription",
      stripePriceId: process.env.STRIPE_PRICE_BLOOM_BOX_8WEEK || "",
      isSubscription: false,
    },
    {
      id: "biweekly-bloom-share",
      name: "Bi-Weekly Bloom Share — 6 Bouquets",
      description: "6 bouquets every other week from June through October.",
      priceCents: 21000,
      type: "subscription",
      stripePriceId: process.env.STRIPE_PRICE_BLOOM_BOX_4WEEK || "",
      isSubscription: false,
    },
  ];
}

export function getProductById(id: string): RDBProduct | undefined {
  return getProducts().find((p) => p.id === id);
}
