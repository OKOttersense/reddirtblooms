/**
 * GHL API Helper — Query pending florist applications (v2 API)
 *
 * Fetches contacts with the "florist-under-review" tag directly from GHL API.
 * This eliminates the need for webhook infrastructure and provides real-time data.
 */

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

export interface GHLContact {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company_name?: string;
  customFields?: Record<string, string>;
  tags?: string[];
}

export interface GHLSearchResponse {
  contacts: GHLContact[];
}

/**
 * Query GHL for all contacts with the florist-under-review tag
 * Returns an array of pending florist applications
 */
export async function getGHLFloristApplications(): Promise<GHLContact[]> {
  const ghlApiKey = process.env.GHL_API_KEY?.trim();
  const ghlLocationId = process.env.GHL_LOCATION_ID?.trim();

  if (!ghlApiKey || !ghlLocationId) {
    console.error("[GHL API] Missing GHL_API_KEY or GHL_LOCATION_ID environment variables");
    return [];
  }

  try {
    const url = `${GHL_BASE}/contacts/search`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ghlApiKey}`,
        "Content-Type": "application/json",
        Version: GHL_VERSION,
      },
      body: JSON.stringify({
        locationId: ghlLocationId,
        pageLimit: 100,
        filters: [{ field: "tags", operator: "contains", value: "florist-under-review" }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[GHL API] Search failed with status ${response.status}:`, errorText);
      return [];
    }

    const data = (await response.json()) as GHLSearchResponse;
    const contacts = data.contacts || [];

    // Filter to only contacts with the florist-under-review tag
    const floristContacts = contacts.filter((contact) =>
      contact.tags?.includes("florist-under-review")
    );

    console.log(`[GHL API] ✅ Retrieved ${floristContacts.length} pending florist applications from GHL`);
    return floristContacts;
  } catch (error) {
    console.error("[GHL API] Error querying florist applications:", error);
    return [];
  }
}

/**
 * Transform GHL contact into florist application object
 */
export function transformGHLContactToApplication(contact: GHLContact) {
  const firstName = contact.firstName || "";
  const lastName = contact.lastName || "";
  const contactName = `${firstName} ${lastName}`.trim() || "Unknown";
  const businessName = contact.company_name || "Unknown Business";
  const customFields = contact.customFields || {};
  const city = customFields.city || "";
  const website = customFields.website || "";

  return {
    ghlContactId: contact.id,
    contactName,
    businessName,
    email: contact.email || "",
    phone: contact.phone || "",
    city,
    website,
  };
}
