/**
 * Diagnostic: compare floristApplications in DB vs contacts in GHL
 */
import "dotenv/config";
import { getDb } from "../server/db";
import { floristApplications } from "../drizzle/schema";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

function ghlHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };
}

async function findContactByEmail(email: string): Promise<{ id: string; firstName?: string; lastName?: string; tags?: string[] } | null> {
  const res = await fetch(`${GHL_BASE}/contacts/search`, {
    method: "POST",
    headers: ghlHeaders(),
    body: JSON.stringify({
      locationId: process.env.GHL_LOCATION_ID,
      pageLimit: 1,
      filters: [{ field: "email", operator: "eq", value: email }],
    }),
  });
  if (!res.ok) return null;
  const data = await res.json() as { contacts?: Array<{ id: string; firstName?: string; lastName?: string; tags?: string[] }> };
  return data.contacts?.[0] ?? null;
}

const db = await getDb();
if (!db) { console.error("DB unavailable"); process.exit(1); }

const apps = await db.select().from(floristApplications);
console.log(`\n=== DB: ${apps.length} florist application(s) ===`);

for (const app of apps) {
  console.log(`\n  DB: ${app.email}`);
  console.log(`    contactName: ${app.contactName}`);
  console.log(`    businessName: ${app.businessName}`);
  console.log(`    status: ${app.status}`);
  console.log(`    createdAt: ${app.createdAt}`);

  // Check GHL
  const contact = await findContactByEmail(app.email);
  if (contact) {
    console.log(`  GHL: FOUND — id: ${contact.id}`);
    console.log(`    firstName: ${contact.firstName || "(none)"}`);
    console.log(`    lastName: ${contact.lastName || "(none)"}`);
    console.log(`    tags: ${(contact.tags || []).join(", ") || "(none)"}`);

    // Validate expected tag
    const expectedTag = app.status === "pending" ? "florist-applicant" : app.status === "approved" ? "florist-approved" : "florist-declined";
    const hasExpectedTag = (contact.tags || []).includes(expectedTag);
    console.log(`    expected tag: ${expectedTag} — ${hasExpectedTag ? "✅ present" : "❌ MISSING"}`);
  } else {
    console.log(`  GHL: ❌ NOT FOUND — contact needs to be created`);
  }
}
