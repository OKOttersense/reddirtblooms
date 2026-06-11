/**
 * Diagnostic: test bouquet bar GHL sync path end-to-end
 */
import "dotenv/config";
import { syncContactToGHL } from "../server/ghl";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

function ghlHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };
}

async function findContactByEmail(email: string) {
  const res = await fetch(`${GHL_BASE}/contacts/search`, {
    method: "POST",
    headers: ghlHeaders(),
    body: JSON.stringify({
      locationId: process.env.GHL_LOCATION_ID,
      pageLimit: 1,
      filters: [{ field: "email", operator: "eq", value: email }],
    }),
  });
  const d = await res.json() as { contacts?: Array<{ id: string; firstName?: string; lastName?: string; tags?: string[] }> };
  return d.contacts?.[0] ?? null;
}

async function deleteContact(id: string) {
  await fetch(`${GHL_BASE}/contacts/${id}`, {
    method: "DELETE",
    headers: ghlHeaders(),
  });
}

const testEmail = `bouquet_test_${Date.now()}@example.com`;
console.log("=== Bouquet Bar GHL Sync Diagnostic ===");
console.log("Test email:", testEmail);

// Simulate exactly what routers.ts does for bouquet.submitInquiry
console.log("\n[1] Calling syncContactToGHL with bouquet-bar-inquiry tag...");
const id = await syncContactToGHL({
  email: testEmail,
  name: "Test Bouquet Customer",
  phone: "405-555-1234",
  tags: ["bouquet-bar-inquiry"],
  source: "Bouquet Bar Inquiry Form",
  customFields: [
    { key: "event_type", field_value: "Wedding" },
    { key: "event_date", field_value: "2026-09-15" },
    { key: "budget", field_value: "$500-$1000" },
  ],
});

console.log("  Returned ID:", id);

if (!id) {
  console.log("  ❌ FAIL: syncContactToGHL returned null — contact was NOT created");
  process.exit(1);
}

// Wait for GHL index propagation
await new Promise((r) => setTimeout(r, 2500));

const contact = await findContactByEmail(testEmail);
if (contact) {
  console.log("  ✅ PASS: Contact found in GHL");
  console.log("  firstName:", contact.firstName || "(none)");
  console.log("  lastName:", contact.lastName || "(none)");
  console.log("  tags:", contact.tags?.join(", ") || "(none)");
  const hasTag = contact.tags?.includes("bouquet-bar-inquiry");
  console.log(hasTag ? "  ✅ PASS: bouquet-bar-inquiry tag present" : "  ❌ FAIL: bouquet-bar-inquiry tag MISSING");
} else {
  console.log("  ❌ FAIL: Contact NOT found in GHL after 2.5s (index delay)");
}

// Cleanup
if (id) {
  await deleteContact(id);
  console.log("\n[Cleanup] Test contact deleted.");
}
