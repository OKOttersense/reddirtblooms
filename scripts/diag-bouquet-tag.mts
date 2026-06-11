/**
 * Diagnostic: verify syncContactToGHL adds tags correctly on existing contacts
 * This simulates what happens when lance.a.neely@gmail.com submits a bouquet inquiry
 * (he already exists in GHL as florist-approved)
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

async function getContact(id: string) {
  const res = await fetch(`${GHL_BASE}/contacts/${id}`, { headers: ghlHeaders() });
  const d = await res.json() as { contact?: { id: string; tags?: string[] } };
  return d.contact;
}

// Simulate: existing contact (florist-approved) submits bouquet inquiry
console.log("=== Bouquet Bar Tag Merge Test ===");
console.log("Testing: existing contact (florist-approved) submits bouquet inquiry");
console.log("Expected: bouquet-bar-inquiry tag ADDED, florist-approved tag PRESERVED");

const existingContactId = "yOXQjqEhl17SoyWxXEiA"; // lance.a.neely@gmail.com

// Check current state
const before = await getContact(existingContactId);
console.log("\nBefore:", before?.tags?.join(", ") || "(none)");

// Call syncContactToGHL — this is what routers.ts does
await syncContactToGHL({
  email: "lance.a.neely@gmail.com",
  name: "Lance Neely",
  phone: "405-555-0000",
  tags: ["bouquet-bar-inquiry"],
  source: "Bouquet Bar Inquiry Form",
});

await new Promise((r) => setTimeout(r, 1000));

const after = await getContact(existingContactId);
console.log("After:", after?.tags?.join(", ") || "(none)");

const hasBouquetTag = after?.tags?.includes("bouquet-bar-inquiry");
const hasFloristTag = after?.tags?.includes("florist-approved");

console.log(hasBouquetTag ? "✅ PASS: bouquet-bar-inquiry tag added" : "❌ FAIL: bouquet-bar-inquiry tag NOT added");
console.log(hasFloristTag ? "✅ PASS: florist-approved tag preserved" : "❌ FAIL: florist-approved tag was removed");

// Clean up: remove the bouquet-bar-inquiry tag we just added
if (hasBouquetTag) {
  await fetch(`${GHL_BASE}/contacts/${existingContactId}/tags`, {
    method: "DELETE",
    headers: ghlHeaders(),
    body: JSON.stringify({ tags: ["bouquet-bar-inquiry"] }),
  });
  console.log("\n[Cleanup] Removed bouquet-bar-inquiry test tag.");
}
