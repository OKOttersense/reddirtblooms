/**
 * Backfill GHL opportunities for all existing florist applications.
 */
import 'dotenv/config';
import { getDb } from '../server/db.ts';
import { floristApplications } from '../drizzle/schema.ts';
import { desc } from 'drizzle-orm';
import { syncFloristToGHL, createFloristOpportunity, moveFloristOpportunityStage } from '../server/ghl.ts';

const db = await getDb();
if (!db) { console.error('No DB'); process.exit(1); }

const rows = await db.select().from(floristApplications).orderBy(desc(floristApplications.createdAt));
console.log(`Found ${rows.length} florist applications`);

// Deduplicate by email — keep latest status per email
const byEmail = new Map<string, typeof rows[0]>();
for (const row of [...rows].reverse()) {
  byEmail.set(row.email, row);
}

let created = 0;
let failed = 0;

for (const app of byEmail.values()) {
  const status = (app.status as 'pending' | 'approved' | 'declined') ?? 'pending';
  console.log(`\nProcessing: ${app.businessName} (${app.email}) — status: ${status}`);

  try {
    const contactId = await syncFloristToGHL({
      email: app.email,
      contactName: app.contactName,
      businessName: app.businessName,
      phone: app.phone ?? null,
      city: app.city ?? null,
      status,
    });

    if (!contactId) {
      console.error(`  FAIL: Could not sync contact`);
      failed++;
      continue;
    }
    console.log(`  Contact ID: ${contactId}`);

    // Check if opportunity already exists
    const locationId = process.env.GHL_LOCATION_ID;
    const searchRes = await fetch(
      `https://services.leadconnectorhq.com/opportunities/search?location_id=${locationId}&pipeline_id=sxqlrrOTzrDai9NiDV2h&contact_id=${contactId}&limit=1`,
      { headers: { Authorization: `Bearer ${process.env.GHL_PRIVATE_API_KEY}`, Version: '2021-07-28' } }
    );
    const searchData = await searchRes.json() as { opportunities?: { id: string }[] };
    const existingOpp = searchData.opportunities?.[0];

    if (existingOpp) {
      console.log(`  Opportunity already exists: ${existingOpp.id} — updating stage`);
      await moveFloristOpportunityStage(contactId, app.businessName, status);
    } else {
      const oppId = await createFloristOpportunity(contactId, app.businessName, status);
      if (oppId) {
        console.log(`  Created opportunity: ${oppId}`);
        if (status !== 'pending') {
          await moveFloristOpportunityStage(contactId, app.businessName, status);
          console.log(`  Moved to stage: ${status}`);
        }
        created++;
      } else {
        console.error(`  FAIL: Could not create opportunity`);
        failed++;
      }
    }

    await new Promise(r => setTimeout(r, 600));
  } catch (err) {
    console.error(`  ERROR:`, err);
    failed++;
  }
}

console.log(`\n=== Backfill complete: ${created} created, ${failed} failed ===`);
process.exit(0);
