import "dotenv/config";

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

function ghlHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };
}

const res = await fetch(`${GHL_BASE}/contacts/search`, {
  method: "POST",
  headers: ghlHeaders(),
  body: JSON.stringify({
    locationId: process.env.GHL_LOCATION_ID,
    pageLimit: 50,
  }),
});

const data = await res.json() as { contacts?: Array<{ id: string; email: string; firstName?: string; lastName?: string; tags?: string[] }> };
const contacts = data.contacts || [];

console.log(`Total contacts in GHL: ${contacts.length}`);
for (const c of contacts) {
  console.log(`  ${c.email} | firstName: ${c.firstName || "(none)"} | lastName: ${c.lastName || "(none)"} | tags: ${(c.tags || []).join(", ")}`);
}

const noName = contacts.filter((c) => !c.firstName && !c.lastName);
console.log(`\nContacts missing name: ${noName.length}`);
if (noName.length > 0) {
  console.log("Missing name contacts:");
  for (const c of noName) {
    console.log(`  ${c.id} — ${c.email}`);
  }
}
