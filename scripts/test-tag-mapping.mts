/**
 * Verify tag mapping: pending → florist-under-review, approved → florist-approved
 */
import "dotenv/config";
import { syncFloristToGHL } from "../server/ghl";

const testEmail = `tagtest_${Date.now()}@example.com`;

async function findContact(email: string) {
  const res = await fetch("https://services.leadconnectorhq.com/contacts/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GHL_API_KEY}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      locationId: process.env.GHL_LOCATION_ID,
      pageLimit: 1,
      filters: [{ field: "email", operator: "eq", value: email }],
    }),
  });
  const d = await res.json() as { contacts?: Array<{ id: string; tags?: string[] }> };
  return d.contacts?.[0] ?? null;
}

async function deleteContact(id: string) {
  await fetch(`https://services.leadconnectorhq.com/contacts/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${process.env.GHL_API_KEY}`, Version: "2021-07-28" },
  });
}

console.log("=== Tag Mapping Test ===");
console.log(`Test email: ${testEmail}`);

// Step 1: Create with pending status
console.log("\n[1] Creating contact with status=pending...");
const id = await syncFloristToGHL({
  email: testEmail,
  contactName: "Tag Test Florist",
  businessName: "Tag Test Flowers",
  status: "pending",
});
console.log("  Created ID:", id);

// Wait for GHL index
await new Promise((r) => setTimeout(r, 2000));

const pending = await findContact(testEmail);
const hasPendingTag = pending?.tags?.includes("florist-under-review");
console.log("  Tags:", pending?.tags?.join(", ") || "(none)");
console.log(hasPendingTag ? "  ✅ PASS: florist-under-review present for pending status" : "  ❌ FAIL: florist-under-review MISSING for pending status");

// Step 2: Update to approved
console.log("\n[2] Updating contact to status=approved...");
await syncFloristToGHL({
  email: testEmail,
  contactName: "Tag Test Florist",
  businessName: "Tag Test Flowers",
  status: "approved",
});

await new Promise((r) => setTimeout(r, 2000));

const approved = await findContact(testEmail);
const hasApprovedTag = approved?.tags?.includes("florist-approved");
const noUnderReview = !approved?.tags?.includes("florist-under-review");
console.log("  Tags:", approved?.tags?.join(", ") || "(none)");
console.log(hasApprovedTag ? "  ✅ PASS: florist-approved present" : "  ❌ FAIL: florist-approved MISSING");
console.log(noUnderReview ? "  ✅ PASS: florist-under-review removed" : "  ❌ FAIL: florist-under-review still present (should be removed)");

// Cleanup
if (id) {
  await deleteContact(id);
  console.log("\n[Cleanup] Test contact deleted.");
}

console.log("\n=== Done ===");
