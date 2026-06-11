/**
 * Stripe → GHL Webhook Handler (v2 API)
 * Creates GHL contacts from Stripe checkout sessions
 * Applies tags and custom fields for email workflow automation
 */

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

function ghlHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    "Content-Type": "application/json",
    Version: GHL_VERSION,
  };
}

interface StripeCheckoutSession {
  id: string;
  customer_email?: string | null;
  client_reference_id?: string | null;
  mode?: string | null;
  // Stripe populates customer_details.name when the buyer enters their name at checkout.
  // This is the most reliable name source — always prefer it over metadata.
  customer_details?: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    address?: {
      city?: string | null;
      country?: string | null;
      postal_code?: string | null;
      state?: string | null;
    } | null;
  } | null;
  metadata?: {
    user_id?: string;
    customer_name?: string;  // set explicitly by server (e.g. florist portal)
    customer_email?: string;
    items?: string;
    amount?: string;
    order_type?: string;
    product_type?: string;
    product_id?: string;
  } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payment_intent?: any;
  amount_total?: number | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  total_details?: any;
}

/**
 * Create GHL contact from Stripe checkout session
 * Called when checkout.session.completed webhook fires
 */
export async function createGHLContactFromStripeCheckout(
  session: StripeCheckoutSession
) {
  const apiKey = process.env.GHL_API_KEY?.trim();
  const locationId = process.env.GHL_LOCATION_ID?.trim();

  if (!apiKey || !locationId) {
    console.error("[GHL] Missing API key or location ID");
    return null;
  }

  try {
    const email = session.customer_email || session.metadata?.customer_email;
    // Prefer customer_details.name (filled by Stripe at checkout) over metadata fallback.
    // metadata.customer_name is only present when the server explicitly sets it.
    const name =
      session.customer_details?.name ||
      session.metadata?.customer_name ||
      "";
    const orderId = session.id;
    const amount = (session.amount_total || 0) / 100;
    const items = session.metadata?.items || "Flowers";
    const orderDate = new Date().toISOString().split("T")[0];

    if (!email) {
      console.error("[GHL] No email found in session");
      return null;
    }

    // Step 1: Check if contact already exists
    const existingContactId = await findContactByEmail(email, locationId);
    let contactId: string;

    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    if (existingContactId) {
      contactId = existingContactId;
      console.log(`[GHL] Found existing contact: ${contactId}`);
      // Update name on existing contact if we have one (was missing before)
      if (firstName) {
        const updateRes = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
          method: "PUT",
          headers: ghlHeaders(),
          // GHL v2 PUT does NOT accept locationId in the body
          body: JSON.stringify({ firstName, lastName }),
        });
        if (!updateRes.ok) {
          const errText = await updateRes.text();
          console.warn("[GHL] Failed to update name on existing contact:", errText);
        } else {
          console.log(`[GHL] Updated name for existing contact ${contactId}: ${firstName} ${lastName}`);
        }
      }
    } else {
      // Step 2: Create new contact
      const createResponse = await fetch(`${GHL_BASE}/contacts/`, {
        method: "POST",
        headers: ghlHeaders(),
        body: JSON.stringify({
          locationId,
          firstName: firstName || "Customer",
          lastName,
          email,
          source: "Stripe Checkout",
        }),
      });

      if (!createResponse.ok) {
        const errBody = await createResponse.json() as { meta?: { contactId?: string } };
        // GHL returns 400 with meta.contactId when a duplicate contact exists
        const dupId = errBody?.meta?.contactId;
        if (dupId) {
          console.log(`[GHL] Duplicate contact detected, using existing ID: ${dupId}`);
          contactId = dupId;
        } else {
          console.error("[GHL] Failed to create contact:", errBody);
          return null;
        }
      } else {
        const createData = await createResponse.json() as { contact?: { id: string } };
        contactId = createData.contact?.id ?? "";
        if (!contactId) {
          console.error("[GHL] No contact ID returned from creation");
          return null;
        }
      }
      console.log(`[GHL] Created/resolved new contact: ${contactId}`);
    }

    // Step 3: Add "stripe-paid" tag
    await addGHLTag(contactId, "stripe-paid", locationId);

    // Step 4: Add product-specific tags based on order type
    const productType = session.metadata?.product_type || "";
    const productId = session.metadata?.product_id || "";
    const isSubscription =
      session.mode === "subscription" ||
      productType === "subscription" ||
      productId.includes("bloom-box");

    if (isSubscription) {
      await addGHLTag(contactId, "csa-subscriber", locationId);
      if (productId.includes("4week") || productId.includes("4-week")) {
        await addGHLTag(contactId, "csa-4week", locationId);
      } else if (productId.includes("8week") || productId.includes("8-week")) {
        await addGHLTag(contactId, "csa-8week", locationId);
      }
      console.log(`[GHL] Tagged ${contactId} as csa-subscriber`);
    } else {
      await addGHLTag(contactId, "harvest-customer", locationId);
      console.log(`[GHL] Tagged ${contactId} as harvest-customer`);
    }

    // Step 5: Update contact with order custom fields
    await updateGHLContactFields(contactId, locationId, {
      last_order_id: orderId,
      last_order_amount: `$${amount.toFixed(2)}`,
      last_order_date: orderDate,
      last_order_items: items,
    });

    console.log(`[GHL] Contact ${contactId} fully synced with payment info and product tags`);
    return contactId;
  } catch (error) {
    console.error("[GHL] Webhook handler error:", error);
    return null;
  }
}

/** Look up a contact by email in GHL v2. Returns the contact id or null. */
async function findContactByEmail(email: string, locationId: string): Promise<string | null> {
  try {
    const res = await fetch(`${GHL_BASE}/contacts/search`, {
      method: "POST",
      headers: ghlHeaders(),
      body: JSON.stringify({
        locationId,
        pageLimit: 1,
        filters: [{ field: "email", operator: "eq", value: email }],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.warn("[GHL] Contact search failed:", res.status, res.statusText, errText);
      return null;
    }
    const data = await res.json() as { contacts?: { id: string }[] };
    return data.contacts?.[0]?.id ?? null;
  } catch (error) {
    console.error("[GHL] Search error:", error);
    return null;
  }
}

/** Update GHL contact custom fields */
async function updateGHLContactFields(
  contactId: string,
  locationId: string,
  fields: Record<string, string>
) {
  try {
    const customFields = Object.entries(fields).map(([key, field_value]) => ({
      key,
      field_value,
    }));
    // GHL v2 PUT does NOT accept locationId in the body
    const response = await fetch(`${GHL_BASE}/contacts/${contactId}`, {
      method: "PUT",
      headers: ghlHeaders(),
      body: JSON.stringify({ customFields }),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("[GHL] Failed to update fields:", error);
      return false;
    }
    console.log(`[GHL] Updated custom fields for ${contactId}`);
    return true;
  } catch (error) {
    console.error("[GHL] Update error:", error);
    return false;
  }
}

/** Add tag to GHL contact (triggers workflow) */
async function addGHLTag(contactId: string, tagName: string, locationId: string) {
  try {
    const response = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
      method: "POST",
      headers: ghlHeaders(),
      body: JSON.stringify({ tags: [tagName] }),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error(`[GHL] Failed to add tag ${tagName}:`, error);
      return false;
    }
    console.log(`[GHL] Added tag '${tagName}' to ${contactId}`);
    return true;
  } catch (error) {
    console.error("[GHL] Tag error:", error);
    return false;
  }
}

/** Handle payment failure */
export async function handleStripePaymentFailed(email: string) {
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  if (!locationId) return;
  try {
    const contactId = await findContactByEmail(email, locationId);
    if (!contactId) {
      console.log(`[GHL] No contact found for ${email}, skipping failure tag`);
      return;
    }
    await addGHLTag(contactId, "stripe-failed", locationId);
    console.log(`[GHL] Added stripe-failed tag to ${contactId}`);
  } catch (error) {
    console.error("[GHL] Payment failed handler error:", error);
  }
}
