#!/usr/bin/env node

/**
 * Sync harvest listings to Stripe
 * Creates products and prices for each flower/stem size combination
 * Updates database with Stripe IDs
 */

import Stripe from 'stripe';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Parse DATABASE_URL: mysql://user:pass@host:port/dbname
const dbUrl = new URL(process.env.DATABASE_URL || 'mysql://root@localhost/reddirtblooms');

const pool = mysql.createPool({
  host: dbUrl.hostname,
  port: dbUrl.port || 3306,
  user: dbUrl.username,
  password: dbUrl.password,
  database: dbUrl.pathname.slice(1),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {},
});

async function syncHarvestToStripe() {
  const connection = await pool.getConnection();

  try {
    console.log('🌸 Starting Stripe sync for harvest listings...\n');

    // Get all published harvest listings
    const [listings] = await connection.query(
      'SELECT id, variety, color, pricingTier, price2Stem, price4Stem, price6Stem FROM harvest_listings WHERE isPublished = true'
    );

    console.log(`Found ${listings.length} published listings\n`);

    for (const listing of listings) {
      const productName = `${listing.variety} (${listing.color})`;
      console.log(`Processing: ${productName}`);

      const stemSizes = [
        { size: 2, price: listing.price2Stem },
        { size: 4, price: listing.price4Stem },
        { size: 6, price: listing.price6Stem },
      ];

      for (const { size, price } of stemSizes) {
        try {
          // Create product if not exists
          const productName2 = `${listing.variety} ${listing.color} - ${size}-Stem Bunch`;
          
          // Check if product already exists
          const products = await stripe.products.list({
            limit: 100,
          });
          
          const existingProduct = products.data.find(p => p.name === productName2);

          let product;
          if (existingProduct) {
            product = existingProduct;
            console.log(`  ✓ Product exists: ${product.id}`);
          } else {
            product = await stripe.products.create({
              name: productName2,
              description: `${listing.variety} (${listing.color}) - ${size}-stem bunch`,
              metadata: {
                variety: listing.variety,
                color: listing.color,
                stemSize: size.toString(),
              },
            });
            console.log(`  ✓ Created product: ${product.id}`);
          }

          // Create price
          const priceObj = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(price * 100), // Convert dollars to cents
            currency: 'usd',
            metadata: {
              variety: listing.variety,
              color: listing.color,
              stemSize: size.toString(),
            },
          });

          console.log(`    ✓ Created price: ${priceObj.id} ($${price})`);

          // Update database
          const priceIdColumn = `stripePriceId${size}Stem`;
          const productIdColumn = `stripeProductId${size}Stem`;
          
          await connection.query(
            `UPDATE harvest_listings SET ${priceIdColumn} = ?, ${productIdColumn} = ?, syncedToStripe = true, lastSyncedAt = NOW() WHERE id = ?`,
            [priceObj.id, product.id, listing.id]
          );

          console.log(`    ✓ Updated database\n`);
        } catch (error) {
          console.error(`  ✗ Error syncing ${size}-stem: ${error.message}\n`);
        }
      }
    }

    console.log('✅ Stripe sync complete!');
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  } finally {
    await connection.release();
    await pool.end();
  }
}

syncHarvestToStripe();
