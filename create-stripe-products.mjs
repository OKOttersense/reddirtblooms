/**
 * Red Dirt Blooms — Stripe Product Bootstrap
 * Farm-direct bunch model: creates 6 bunch products (premium/specialty × 2/4/6 stems)
 * plus 2 subscription products.
 *
 * Run once per Stripe account:
 *   node create-stripe-products.mjs
 *
 * Copy the output env vars into your Manus project secrets.
 */

import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });

const PRODUCTS = [
  { id: "premium-2stem",   name: "Premium Bunch — 2 Stems",   priceCents: 500,   envKey: "STRIPE_PRICE_PREMIUM_2STEM" },
  { id: "premium-4stem",   name: "Premium Bunch — 4 Stems",   priceCents: 900,   envKey: "STRIPE_PRICE_PREMIUM_4STEM" },
  { id: "premium-6stem",   name: "Premium Bunch — 6 Stems",   priceCents: 1200,  envKey: "STRIPE_PRICE_PREMIUM_6STEM" },
  { id: "specialty-2stem", name: "Specialty Bunch — 2 Stems", priceCents: 900,   envKey: "STRIPE_PRICE_SPECIALTY_2STEM" },
  { id: "specialty-4stem", name: "Specialty Bunch — 4 Stems", priceCents: 1500,  envKey: "STRIPE_PRICE_SPECIALTY_4STEM" },
  { id: "specialty-6stem", name: "Specialty Bunch — 6 Stems", priceCents: 2100,  envKey: "STRIPE_PRICE_SPECIALTY_6STEM" },
  { id: "weekly-bloom-share",   name: "Weekly Bloom Share — 12 Weeks",      priceCents: 39600, envKey: "STRIPE_PRICE_BLOOM_BOX_8WEEK" },
  { id: "biweekly-bloom-share", name: "Bi-Weekly Bloom Share — 6 Bouquets", priceCents: 21000, envKey: "STRIPE_PRICE_BLOOM_BOX_4WEEK" },
];

console.log("Creating Stripe products for Red Dirt Blooms (farm-direct bunch model)...\n");

const results = [];

for (const p of PRODUCTS) {
  try {
    const product = await stripe.products.create({
      name: p.name,
      metadata: { rdb_product_id: p.id },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: p.priceCents,
      currency: "usd",
    });

    results.push({ envKey: p.envKey, priceId: price.id, name: p.name });
    console.log(`✓ ${p.name} — ${price.id}`);
  } catch (err) {
    console.error(`✗ ${p.name}: ${err.message}`);
  }
}

console.log("\n=== Add these to your Manus project secrets ===\n");
for (const r of results) {
  console.log(`${r.envKey}=${r.priceId}`);
}
console.log("\nDone!");
