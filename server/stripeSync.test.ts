import { describe, it, expect } from 'vitest';
import { getBunchPrice, TIER_PRICES, TIER_LABELS } from './stripeProducts';

/**
 * Phase 1: Unit Tests for Stripe Sync System
 * 
 * Tests:
 * 1.1 — Pricing Tier Structure Validation
 * 1.2 — Price Lookup by Tier and Stem Size
 * 1.3 — Tier Labels and Constants
 */

describe('Stripe Sync System — Phase 1 Unit Tests', () => {
  
  // ── Test 1.1: Pricing Tier Structure ────────────────────────────────────
  describe('Test 1.1: TIER_PRICES structure validation', () => {
    
    it('should have correct Premium tier prices (cents)', () => {
      expect(TIER_PRICES.premium[2]).toBe(500);   // $5.00
      expect(TIER_PRICES.premium[4]).toBe(900);   // $9.00
      expect(TIER_PRICES.premium[6]).toBe(1200);  // $12.00
    });

    it('should have correct Specialty tier prices (cents)', () => {
      expect(TIER_PRICES.specialty[2]).toBe(900);   // $9.00
      expect(TIER_PRICES.specialty[4]).toBe(1500);  // $15.00
      expect(TIER_PRICES.specialty[6]).toBe(2100);  // $21.00
    });

    it('should have zero prices for Focal tier (uses per-listing override)', () => {
      expect(TIER_PRICES.focal[2]).toBe(0);
      expect(TIER_PRICES.focal[4]).toBe(0);
      expect(TIER_PRICES.focal[6]).toBe(0);
    });

    it('should have all 3 tiers defined', () => {
      expect(Object.keys(TIER_PRICES)).toHaveLength(3);
      expect(TIER_PRICES).toHaveProperty('premium');
      expect(TIER_PRICES).toHaveProperty('specialty');
      expect(TIER_PRICES).toHaveProperty('focal');
    });

    it('should have all 3 stem sizes per tier', () => {
      for (const tier of Object.values(TIER_PRICES)) {
        expect(Object.keys(tier)).toHaveLength(3);
        expect(tier).toHaveProperty('2');
        expect(tier).toHaveProperty('4');
        expect(tier).toHaveProperty('6');
      }
    });

    it('should maintain price progression (larger bunches cost more)', () => {
      // Premium tier progression
      expect(TIER_PRICES.premium[2] < TIER_PRICES.premium[4]).toBe(true);
      expect(TIER_PRICES.premium[4] < TIER_PRICES.premium[6]).toBe(true);
      
      // Specialty tier progression
      expect(TIER_PRICES.specialty[2] < TIER_PRICES.specialty[4]).toBe(true);
      expect(TIER_PRICES.specialty[4] < TIER_PRICES.specialty[6]).toBe(true);
    });

    it('should show Specialty tier is more expensive than Premium', () => {
      expect(TIER_PRICES.specialty[2] > TIER_PRICES.premium[2]).toBe(true);
      expect(TIER_PRICES.specialty[4] > TIER_PRICES.premium[4]).toBe(true);
      expect(TIER_PRICES.specialty[6] > TIER_PRICES.premium[6]).toBe(true);
    });

    it('should have correct price differences between tiers', () => {
      // Specialty 2-stem should be $4 more than Premium 2-stem
      expect(TIER_PRICES.specialty[2] - TIER_PRICES.premium[2]).toBe(400);
      
      // Specialty 4-stem should be $6 more than Premium 4-stem
      expect(TIER_PRICES.specialty[4] - TIER_PRICES.premium[4]).toBe(600);
      
      // Specialty 6-stem should be $9 more than Premium 6-stem
      expect(TIER_PRICES.specialty[6] - TIER_PRICES.premium[6]).toBe(900);
    });
  });

  // ── Test 1.2: Price Lookup by Tier ──────────────────────────────────────
  describe('Test 1.2: getBunchPrice function', () => {
    
    it('should return 500 cents ($5) for Premium 2-stem', () => {
      const price = getBunchPrice('premium', 2);
      expect(price).toBe(500);
    });

    it('should return 900 cents ($9) for Premium 4-stem', () => {
      const price = getBunchPrice('premium', 4);
      expect(price).toBe(900);
    });

    it('should return 1200 cents ($12) for Premium 6-stem', () => {
      const price = getBunchPrice('premium', 6);
      expect(price).toBe(1200);
    });

    it('should return 900 cents ($9) for Specialty 2-stem', () => {
      const price = getBunchPrice('specialty', 2);
      expect(price).toBe(900);
    });

    it('should return 1500 cents ($15) for Specialty 4-stem', () => {
      const price = getBunchPrice('specialty', 4);
      expect(price).toBe(1500);
    });

    it('should return 2100 cents ($21) for Specialty 6-stem', () => {
      const price = getBunchPrice('specialty', 6);
      expect(price).toBe(2100);
    });

    it('should return 0 for Focal tier without override', () => {
      expect(getBunchPrice('focal', 2)).toBe(0);
      expect(getBunchPrice('focal', 4)).toBe(0);
      expect(getBunchPrice('focal', 6)).toBe(0);
    });

    it('should return custom focalPrice when provided', () => {
      const customPrice = 1400; // $14.00
      expect(getBunchPrice('focal', 2, customPrice)).toBe(1400);
      expect(getBunchPrice('focal', 4, customPrice)).toBe(1400);
      expect(getBunchPrice('focal', 6, customPrice)).toBe(1400);
    });

    it('should return all 9 tier/size combinations correctly', () => {
      const tiers = ['premium', 'specialty', 'focal'] as const;
      const sizes = [2, 4, 6] as const;
      const expectedPrices = [500, 900, 1200, 900, 1500, 2100, 0, 0, 0];

      const prices = tiers.flatMap(tier =>
        sizes.map(size => getBunchPrice(tier, size))
      );

      expect(prices).toEqual(expectedPrices);
    });

    it('should handle all stem sizes for each tier', () => {
      const tiers = ['premium', 'specialty', 'focal'] as const;
      
      for (const tier of tiers) {
        const price2 = getBunchPrice(tier, 2);
        const price4 = getBunchPrice(tier, 4);
        const price6 = getBunchPrice(tier, 6);
        
        expect(typeof price2).toBe('number');
        expect(typeof price4).toBe('number');
        expect(typeof price6).toBe('number');
      }
    });
  });

  // ── Test 1.3: Tier Labels and Constants ──────────────────────────────────
  describe('Test 1.3: TIER_LABELS constants', () => {
    
    it('should have correct label for Premium tier', () => {
      expect(TIER_LABELS.premium).toBe('Premium');
    });

    it('should have correct label for Specialty tier', () => {
      expect(TIER_LABELS.specialty).toBe('Specialty');
    });

    it('should have correct label for Focal tier', () => {
      expect(TIER_LABELS.focal).toBe('Focal / Single');
    });

    it('should have all 3 tier labels defined', () => {
      expect(Object.keys(TIER_LABELS)).toHaveLength(3);
      expect(TIER_LABELS).toHaveProperty('premium');
      expect(TIER_LABELS).toHaveProperty('specialty');
      expect(TIER_LABELS).toHaveProperty('focal');
    });

    it('should have non-empty labels for all tiers', () => {
      for (const label of Object.values(TIER_LABELS)) {
        expect(label.length).toBeGreaterThan(0);
      }
    });

    it('should match tier keys between TIER_PRICES and TIER_LABELS', () => {
      const priceKeys = Object.keys(TIER_PRICES).sort();
      const labelKeys = Object.keys(TIER_LABELS).sort();
      expect(priceKeys).toEqual(labelKeys);
    });
  });

  // ── Test 1.4: Price Consistency Checks ──────────────────────────────────
  describe('Test 1.4: Price consistency and edge cases', () => {
    
    it('should always return positive prices for Premium and Specialty', () => {
      const tiers = ['premium', 'specialty'] as const;
      const sizes = [2, 4, 6] as const;
      
      for (const tier of tiers) {
        for (const size of sizes) {
          const price = getBunchPrice(tier, size);
          expect(price).toBeGreaterThan(0);
        }
      }
    });

    it('should return zero for Focal without override', () => {
      const sizes = [2, 4, 6] as const;
      
      for (const size of sizes) {
        const price = getBunchPrice('focal', size);
        expect(price).toBe(0);
      }
    });

    it('should handle large focal prices correctly', () => {
      const largePrice = 50000; // $500.00
      expect(getBunchPrice('focal', 2, largePrice)).toBe(50000);
    });

    it('should handle small focal prices correctly', () => {
      const smallPrice = 1; // $0.01
      expect(getBunchPrice('focal', 2, smallPrice)).toBe(1);
    });

    it('should return prices in cents (not dollars)', () => {
      const premiumPrice = getBunchPrice('premium', 2);
      // $5.00 = 500 cents
      expect(premiumPrice).toBe(500);
      expect(premiumPrice).not.toBe(5);
    });

    it('should maintain consistency across multiple calls', () => {
      const price1 = getBunchPrice('premium', 4);
      const price2 = getBunchPrice('premium', 4);
      const price3 = getBunchPrice('premium', 4);
      
      expect(price1).toBe(price2);
      expect(price2).toBe(price3);
    });
  });
});
