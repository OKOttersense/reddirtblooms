/**
 * Restore lance contact's florist-approved tag and verify bouquet tag merge
 */
import "dotenv/config";
import { syncContactToGHL } from "../server/ghl";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const LANCE_ID = "yOXQjqEhl17SoyWxXEiA";

function ghlHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };
}

async function getContactTags(id: string): Promise<string[]> {
  const res = await fetch(`${GHL_BASE}/contacts/${id}`, { headers: ghlHeaders() });
  const d = await res.json() as { contact?: { tags?: string[] } };
  return d.contact?.tags ?? [];
}

async function addTags(id: string, tags: string[]) {
  await fetch(`${GHL_BASE}/contacts/${id}/tags`, {
    method: "POST",
    headers: ghlHeaders(),
    body: JSON.stringify({ tags }),
  });
}

async function removeTags(id: string, tags: string[]) {
  await fetch(`${GHL_BASE}/contacts/${id}/tags`, {
    method: "DELETE",
    headers: ghlHeaders(),
    body: JSON.stringify({ tags }),
  });
}

// Step 1: Restore florist-approved and florist-portal tags
console.log("=== Step 1: Restore lance contact tags ===");
await addTags(LANCE_ID, ["florist-approved", "florist-portal"]);
await new Promise((r) => setTimeout(r, 500));
const restored = await getContactTags(LANCE_ID);
console.log("Tags after restore:", restored.join(", ") || "(none)");

// Step 2: Simulate bouquet inquiry from same email
console.log("\n=== Step 2: Simulate bouquet inquiry (existing contact) ===");
await syncContactToGHL({
  email: "lance.a.neely@gmail.com",
  name: "Lance Neely",
  phone: "405-555-0000",
  tags: ["bouquet-bar-inquiry"],
  source: "Bouquet Bar Inquiry Form",
});

await new Promise((r) => setTimeout(r, 1000));
const after = await getContactTags(LANCE_ID);
console.log("Tags after inquiry:", after.join(", ") || "(none)");

const hasBouquet = after.includes("bouquet-bar-inquiry");
const hasFlorist = after.includes("florist-approved");
const hasPortal = after.includes("florist-portal");

console.log(hasBouquet ? "✅ PASS: bouquet-bar-inquiry tag added" : "❌ FAIL: bouquet-bar-inquiry tag MISSING");
console.log(hasFlorist ? "✅ PASS: florist-approved tag preserved" : "❌ FAIL: florist-approved tag was REMOVED");
console.log(hasPortal ? "✅ PASS: florist-portal tag preserved" : "❌ FAIL: florist-portal tag was REMOVED");

// Step 3: Cleanup — remove bouquet tag, keep florist tags
console.log("\n=== Step 3: Cleanup ===");
await removeTags(LANCE_ID, ["bouquet-bar-inquiry"]);
const final = await getContactTags(LANCE_ID);
console.log("Final tags:", final.join(", ") || "(none)");
