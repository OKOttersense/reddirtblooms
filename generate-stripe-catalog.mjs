#!/usr/bin/env node

/**
 * Generate Excel workbook with Stripe product catalog
 * Usage: node generate-stripe-catalog.mjs
 * 
 * Creates a comprehensive product catalog with:
 * - All varieties and their pricing tiers
 * - Stripe product naming convention
 * - Pricing breakdown (2-stem, 4-stem, 6-stem)
 * - Sync status tracking
 * - Instructions for manual entry
 */

import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define pricing tiers
const PRICING_TIERS = {
  premium: { '2Stem': 5, '4Stem': 9, '6Stem': 12 },
  specialty: { '2Stem': 9, '4Stem': 15, '6Stem': 21 },
  focal: { '2Stem': 0.01, '4Stem': 0.01, '6Stem': 0.01 }, // Placeholder
};

// Define varieties (from your farm)
const VARIETIES = [
  { name: 'Gaura', color: 'Pink', tier: 'premium' },
  { name: 'Yarrow', color: 'Purple', tier: 'premium' },
  { name: 'Lamb\'s Ear', color: 'Silver', tier: 'premium' },
  { name: 'Peonies', color: 'Red', tier: 'specialty' },
  { name: 'Zinnias', color: 'Mixed', tier: 'specialty' },
  { name: 'Dahlias', color: 'Orange', tier: 'specialty' },
  { name: 'Echinacea', color: 'Purple', tier: 'premium' },
  { name: 'Phlox', color: 'Pink', tier: 'specialty' },
];

// Create workbook
const workbook = new ExcelJS.Workbook();

// ── Sheet 1: Product Catalog ──
const catalogSheet = workbook.addWorksheet('Product Catalog');
catalogSheet.columns = [
  { header: 'Variety', key: 'variety', width: 15 },
  { header: 'Color', key: 'color', width: 12 },
  { header: 'Tier', key: 'tier', width: 12 },
  { header: 'Stripe Product Name (2-Stem)', key: 'productName2', width: 35 },
  { header: 'Stripe Product Name (4-Stem)', key: 'productName4', width: 35 },
  { header: 'Stripe Product Name (6-Stem)', key: 'productName6', width: 35 },
  { header: 'Price 2-Stem', key: 'price2', width: 12 },
  { header: 'Price 4-Stem', key: 'price4', width: 12 },
  { header: 'Price 6-Stem', key: 'price6', width: 12 },
  { header: 'Stripe Product ID (2-Stem)', key: 'stripeId2', width: 15 },
  { header: 'Stripe Product ID (4-Stem)', key: 'stripeId4', width: 15 },
  { header: 'Stripe Product ID (6-Stem)', key: 'stripeId6', width: 15 },
  { header: 'Stripe Price ID (2-Stem)', key: 'stripePriceId2', width: 15 },
  { header: 'Stripe Price ID (4-Stem)', key: 'stripePriceId4', width: 15 },
  { header: 'Stripe Price ID (6-Stem)', key: 'stripePriceId6', width: 15 },
  { header: 'Synced to Stripe', key: 'synced', width: 12 },
  { header: 'Last Synced', key: 'lastSynced', width: 15 },
];

// Style header row
catalogSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
catalogSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFB5451B' } };

// Add product rows
VARIETIES.forEach((variety, idx) => {
  const prices = PRICING_TIERS[variety.tier];
  const row = {
    variety: variety.name,
    color: variety.color,
    tier: variety.tier,
    productName2: `${variety.name}-${variety.color}-2Stem-${variety.tier.charAt(0).toUpperCase() + variety.tier.slice(1)} Bunch`,
    productName4: `${variety.name}-${variety.color}-4Stem-${variety.tier.charAt(0).toUpperCase() + variety.tier.slice(1)} Bunch`,
    productName6: `${variety.name}-${variety.color}-6Stem-${variety.tier.charAt(0).toUpperCase() + variety.tier.slice(1)} Bunch`,
    price2: `$${prices['2Stem'].toFixed(2)}`,
    price4: `$${prices['4Stem'].toFixed(2)}`,
    price6: `$${prices['6Stem'].toFixed(2)}`,
    stripeId2: '', // To be filled after sync
    stripeId4: '',
    stripeId6: '',
    stripePriceId2: '',
    stripePriceId4: '',
    stripePriceId6: '',
    synced: 'No',
    lastSynced: '',
  };
  catalogSheet.addRow(row);
});

// ── Sheet 2: Pricing Tiers Reference ──
const tiersSheet = workbook.addWorksheet('Pricing Tiers');
tiersSheet.columns = [
  { header: 'Tier', key: 'tier', width: 15 },
  { header: '2-Stem Price', key: 'price2', width: 15 },
  { header: '4-Stem Price', key: 'price4', width: 15 },
  { header: '6-Stem Price', key: 'price6', width: 15 },
  { header: 'Description', key: 'description', width: 30 },
];

tiersSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
tiersSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7A8C6E' } };

tiersSheet.addRow({
  tier: 'Premium',
  price2: '$5.00',
  price4: '$9.00',
  price6: '$12.00',
  description: 'Standard filler/accent flowers (Gaura, Yarrow, Lamb\'s Ear, Echinacea)',
});

tiersSheet.addRow({
  tier: 'Specialty',
  price2: '$9.00',
  price4: '$15.00',
  price6: '$21.00',
  description: 'Premium focal/feature flowers (Peonies, Zinnias, Dahlias, Phlox)',
});

tiersSheet.addRow({
  tier: 'Focal',
  price2: 'Market',
  price4: 'Market',
  price6: 'Market',
  description: 'Single stems or specialty varieties priced by market demand',
});

// ── Sheet 3: Sync Instructions ──
const instructionsSheet = workbook.addWorksheet('Sync Instructions');
instructionsSheet.columns = [
  { header: 'Step', key: 'step', width: 5 },
  { header: 'Action', key: 'action', width: 50 },
  { header: 'Details', key: 'details', width: 50 },
];

instructionsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
instructionsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8A020' } };

const instructions = [
  {
    step: 1,
    action: 'Create Listing in Admin',
    details: 'Go to Admin Dashboard → Harvest tab → New Listing. Enter variety, color, tier, and quantity.',
  },
  {
    step: 2,
    action: 'Sync to Stripe',
    details: 'Click "Sync to Stripe" button on the listing card. System creates 3 Stripe products (2/4/6 stem).',
  },
  {
    step: 3,
    action: 'Verify in Stripe',
    details: 'Log into Stripe dashboard → Products. Verify products exist with correct naming and pricing.',
  },
  {
    step: 4,
    action: 'Update Excel',
    details: 'Copy Stripe Product IDs and Price IDs from Stripe dashboard into this workbook for record-keeping.',
  },
  {
    step: 5,
    action: 'Publish Listing',
    details: 'Return to Admin Dashboard → Click "Publish" to make available to florists.',
  },
  {
    step: 6,
    action: 'Florist Orders',
    details: 'Florists can now order via Harvest Stand. Orders create Stripe checkout sessions using synced product IDs.',
  },
];

instructions.forEach(inst => {
  instructionsSheet.addRow(inst);
});

// ── Sheet 4: Naming Convention Guide ──
const namingSheet = workbook.addWorksheet('Naming Convention');
namingSheet.columns = [
  { header: 'Component', key: 'component', width: 15 },
  { header: 'Value', key: 'value', width: 20 },
  { header: 'Example', key: 'example', width: 30 },
];

namingSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
namingSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2A1F1A' } };

namingSheet.addRow({
  component: 'Format',
  value: '{Variety}-{Color}-{StemSize}Stem-{Tier} Bunch',
  example: 'Gaura-Pink-2Stem-Premium Bunch',
});

namingSheet.addRow({
  component: 'Variety',
  value: 'Flower name',
  example: 'Gaura, Yarrow, Dahlia',
});

namingSheet.addRow({
  component: 'Color',
  value: 'Dominant color',
  example: 'Pink, Purple, Red, Mixed',
});

namingSheet.addRow({
  component: 'StemSize',
  value: '2, 4, or 6',
  example: '2Stem, 4Stem, 6Stem',
});

namingSheet.addRow({
  component: 'Tier',
  value: 'Premium, Specialty, or Focal',
  example: 'Premium Bunch, Specialty Bunch, Focal Bunch',
});

// Save workbook
const outputPath = path.join(__dirname, 'Stripe-Product-Catalog.xlsx');
await workbook.xlsx.writeFile(outputPath);

console.log(`✅ Excel workbook created: ${outputPath}`);
console.log(`📊 Included sheets:`);
console.log(`   - Product Catalog (${VARIETIES.length} varieties)`);
console.log(`   - Pricing Tiers Reference`);
console.log(`   - Sync Instructions`);
console.log(`   - Naming Convention Guide`);
