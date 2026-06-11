#!/usr/bin/env node

/**
 * Fetch actual Stripe price IDs and update database
 */

import Stripe from 'stripe';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Parse DATABASE_URL
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

async function updatePricesFromStripe() {
  const connection = await pool.getConnection();

  try {
    console.log('🔄 Fetching Stripe prices...\n');

    // Get all prices from Stripe
    const prices = await stripe.prices.list({ limit: 100 });
    
    console.log(`Found ${prices.data.length} prices in Stripe\n`);

    // Map prices by product name
    const priceMap = {};
    for (const price of prices.data) {
      if (!price.product || typeof price.product === 'string') continue;
      
      const product = await stripe.products.retrieve(price.product);
      const name = product.name;
      
      if (!priceMap[name]) {
        priceMap[name] = [];
      }
      priceMap[name].push({
        priceId: price.id,
        amount: price.unit_amount / 100,
        productId: product.id,
      });
    }

    console.log('Price map created. Updating database...\n');

    // Get all harvest listings
    const [listings] = await connection.query(
      'SELECT id, variety, color FROM harvest_listings WHERE isPublished = true'
    );

    for (const listing of listings) {
      const searchName = `${listing.variety} ${listing.color}`;
      console.log(`Processing: ${searchName}`);

      const stemSizes = [2, 4, 6];
      
      for (const size of stemSizes) {
        const fullName = `${searchName} - ${size}-Stem Bunch`;
        const priceData = priceMap[fullName];

        if (!priceData || priceData.length === 0) {
          console.log(`  ⚠️  No price found for: ${fullName}`);
          continue;
        }

        const price = priceData[0]; // Get first matching price
        const priceIdCol = `stripePriceId${size}Stem`;
        const productIdCol = `stripeProductId${size}Stem`;

        await connection.query(
          `UPDATE harvest_listings SET ${priceIdCol} = ?, ${productIdCol} = ? WHERE id = ?`,
          [price.priceId, price.productId, listing.id]
        );

        console.log(`  ✓ ${size}-stem: ${price.priceId} ($${price.amount})`);
      }
      console.log('');
    }

    console.log('✅ Database updated with Stripe price IDs!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await connection.release();
    await pool.end();
  }
}

updatePricesFromStripe();
