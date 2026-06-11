/**
 * Tests for the farm-direct bunch pricing model.
 * Validates tier pricing logic and that all required Stripe price IDs are set.
 */
import { describe, expect, it } from "vitest";
import { getBunchPrice, getProducts, TIER_PRICES, type PricingTier, type StemSize } from "./stripeProducts";

describe("stripeProducts — bunch pricing model", () => {
  it("returns correct premium tier prices", () => {
    expect(getBunchPrice("premium", 2)).toBe(500);
    expect(getBunchPrice("premium", 4)).toBe(900);
    expect(getBunchPrice("premium", 6)).toBe(1200);
  });

  it("returns correct specialty tier prices", () => {
    expect(getBunchPrice("specialty", 2)).toBe(900);
    expect(getBunchPrice("specialty", 4)).toBe(1500);
    expect(getBunchPrice("specialty", 6)).toBe(2100);
  });

  it("returns focalPriceCents for focal tier", () => {
    expect(getBunchPrice("focal", 2, 1500)).toBe(1500);
    expect(getBunchPrice("focal", 4, 2500)).toBe(2500);
    expect(getBunchPrice("focal", 6, 0)).toBe(0);
  });

  it("all 8 products are defined", () => {
    const products = getProducts();
    expect(products).toHaveLength(8);
  });

  it("bunch products have correct price cents", () => {
    const products = getProducts();
    const p2 = products.find((p) => p.id === "premium-2stem");
    const s4 = products.find((p) => p.id === "specialty-4stem");
    expect(p2?.priceCents).toBe(500);
    expect(s4?.priceCents).toBe(1500);
  });

  it("all bunch products have a stripePriceId env var set", () => {
    const bunchIds = [
      "premium-2stem", "premium-4stem", "premium-6stem",
      "specialty-2stem", "specialty-4stem", "specialty-6stem",
    ];
    const products = getProducts();
    for (const id of bunchIds) {
      const p = products.find((prod) => prod.id === id);
      expect(p, `Product ${id} should exist`).toBeDefined();
      expect(p!.stripePriceId, `${id} should have a Stripe price ID`).not.toBe("");
    }
  });
});
