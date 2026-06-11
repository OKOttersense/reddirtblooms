import { syncFloristToGHL } from "../server/ghl.js";
import { handleCheckoutCompletedGHL } from "../server/ghlWebhook.js";
import type Stripe from "stripe";

const KEY = process.env.GHL_API_KEY!;
const LOC = process.env.GHL_LOCATION_ID!;
const H: Record<string, string> = {
  Authorization: "Bearer " + KEY,
  "Content-Type": "application/json",
  Version: "2021-07-28",
};

async function deleteTestContact(email: string) {
  const sr = await fetch("https://services.leadconnectorhq.com/contacts/search", {
    method: "POST",
    headers: H,
    body: JSON.stringify({ locationId: LOC, pageLimit: 1, filters: [{ field: "email", operator: "eq", value: email }] }),
  });
  const sd = (await sr.json()) as { contacts?: { id: string }[] };
  const cid = sd.contacts?.[0]?.id;
  if (cid) {
    await fetch(`https://services.leadconnectorhq.com/contacts/${cid}`, { method: "DELETE", headers: H });
    console.log("  Cleaned up:", email);
  }
}

let passed = 0;
let failed = 0;

// ── TEST 1: syncFloristToGHL — new contact ──────────────────────────────────
console.log("=== TEST 1: syncFloristToGHL (new contact) ===");
const id1 = await syncFloristToGHL({
  email: "e2etest_florist@example.com",
  contactName: "Jane Florist",
  businessName: "Petal & Stem OKC",
  phone: "4055550001",
  city: "Edmond",
  website: "https://petalandstem.com",
  status: "approved",
});
if (id1) { console.log("  PASS — contact ID:", id1); passed++; }
else { console.log("  FAIL — null returned"); failed++; }

// ── TEST 2: syncFloristToGHL — update existing ──────────────────────────────
console.log("\n=== TEST 2: syncFloristToGHL (update existing) ===");
const id2 = await syncFloristToGHL({
  email: "e2etest_florist@example.com",
  contactName: "Jane Florist",
  businessName: "Petal & Stem OKC Updated",
  phone: "4055550001",
  city: "Edmond",
  status: "approved",
});
if (id2) { console.log("  PASS — updated ID:", id2); passed++; }
else { console.log("  FAIL — null returned"); failed++; }

// ── TEST 3: handleCheckoutCompletedGHL — new customer ──────────────────────
console.log("\n=== TEST 3: handleCheckoutCompletedGHL (new customer) ===");
const fakeSession = {
  id: "cs_test_e2e_123",
  mode: "payment",
  customer_email: "e2etest_customer@example.com",
  customer_details: { email: "e2etest_customer@example.com", name: "Bob Customer" },
  amount_total: 4500,
  metadata: {
    product_id: "premium-bouquet",
    product_type: "bouquet",
    product_name: "Premium Bouquet — 4-stem bunch",
    customer_name: "Bob Customer",
    customer_email: "e2etest_customer@example.com",
    is_gift: "false",
    gift_recipient: "",
    gift_message: "",
    newsletter_opt_in: "true",
  },
} as unknown as Stripe.Checkout.Session;

try {
  await handleCheckoutCompletedGHL(fakeSession);
  // GHL search index has a propagation delay — wait before verifying
  await new Promise(r => setTimeout(r, 2000));
  // Verify contact was created
  const vr = await fetch("https://services.leadconnectorhq.com/contacts/search", {
    method: "POST",
    headers: H,
    body: JSON.stringify({ locationId: LOC, pageLimit: 1, filters: [{ field: "email", operator: "eq", value: "e2etest_customer@example.com" }] }),
  });
  const vd = (await vr.json()) as { contacts?: { id: string; tags?: string[] }[] };
  const contact = vd.contacts?.[0];
  if (contact?.id) {
    console.log("  PASS — contact created:", contact.id, "tags:", contact.tags);
    passed++;
  } else {
    console.log("  FAIL — contact not found in GHL after sync");
    failed++;
  }
} catch (e) {
  console.log("  FAIL — threw error:", e);
  failed++;
}

// ── CLEANUP ─────────────────────────────────────────────────────────────────
console.log("\n=== CLEANUP ===");
await deleteTestContact("e2etest_florist@example.com");
await deleteTestContact("e2etest_customer@example.com");

console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
