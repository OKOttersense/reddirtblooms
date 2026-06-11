/**
 * Red Dirt Blooms — Stripe → GoHighLevel Webhook Bridge
 *
 * This module is called from within the existing stripeWebhook.ts handler
 * after signature verification and order DB write. It translates Stripe
 * checkout.session.completed and payment_intent.payment_failed events into
 * GHL contact creation / tag updates.
 *
 * Required env vars (set via webdev_request_secrets):
 *   GHL_API_KEY       — Private Integration key with contacts.write + contacts.read
 *   GHL_LOCATION_ID   — GHL Sub-Account Location ID (Settings → Business Profile)
 */

import type Stripe from "stripe";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GhlContactPayload {
  locationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  tags: string[];
  // GHL v2 uses "customFields" (plural array), NOT "customField" (singular object)
  customFields: Array<{ key: string; field_value: string }>;
  source: string;
}

interface GhlContact {
  id: string;
  email: string;
  tags: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ghlHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY || ""}`,
    "Content-Type": "application/json",
    Version: "2021-07-28",
  };
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}

/**
 * Look up a contact in GHL by email.
 * Returns the contact object or null if not found.
 */
async function findContactByEmail(email: string): Promise<GhlContact | null> {
  const locationId = process.env.GHL_LOCATION_ID || "";
  if (!locationId || !process.env.GHL_API_KEY) return null;

  try {
    // GHL v2: use POST /contacts/search with filters — GET query params are rejected
    const res = await fetch("https://services.leadconnectorhq.com/contacts/search", {
      method: "POST",
      headers: ghlHeaders(),
      body: JSON.stringify({
        locationId,
        pageLimit: 1,
        filters: [{ field: "email", operator: "eq", value: email }],
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[GHL] findContactByEmail failed:", res.status, body);
      return null;
    }
    const data = (await res.json()) as { contacts?: GhlContact[] };
    return data.contacts?.[0] ?? null;
  } catch (err) {
    console.error("[GHL] findContactByEmail error:", err);
    return null;
  }
}

/**
 * Create a new GHL contact.
 */
async function createContact(payload: GhlContactPayload): Promise<string | null> {
  try {
    const res = await fetch("https://services.leadconnectorhq.com/contacts/", {
      method: "POST",
      headers: ghlHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[GHL] createContact failed:", res.status, body);
      return null;
    }
    const data = (await res.json()) as { contact?: { id: string } };
    return data.contact?.id ?? null;
  } catch (err) {
    console.error("[GHL] createContact error:", err);
    return null;
  }
}

/**
 * Add tags to an existing GHL contact.
 */
async function addTagsToContact(contactId: string, tags: string[]): Promise<void> {
  try {
    const res = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}/tags`, {
      method: "POST",
      headers: ghlHeaders(),
      body: JSON.stringify({ tags }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[GHL] addTagsToContact failed:", res.status, body);
    }
  } catch (err) {
    console.error("[GHL] addTagsToContact error:", err);
  }
}

/**
 * Update custom fields on an existing GHL contact.
 */
async function updateContactFields(
  contactId: string,
  customField: Record<string, string>
): Promise<void> {
  try {
    // GHL v2: key is "customFields" (plural array); locationId must NOT be in PUT body
    const customFields = Object.entries(customField).map(([key, field_value]) => ({ key, field_value }));
    const res = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
      method: "PUT",
      headers: ghlHeaders(),
      body: JSON.stringify({ customFields }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[GHL] updateContactFields failed:", res.status, body);
    }
  } catch (err) {
    console.error("[GHL] updateContactFields error:", err);
  }
}

// ─── Season helpers ───────────────────────────────────────────────────────────

/**
 * Calculate the CSA season start (mid-June of the current year) and
 * end (mid-October of the current year) as ISO date strings.
 */
function csaSeasonDates(): { startDate: string; endDate: string } {
  const year = new Date().getFullYear();
  // First harvest is approximately June 12; season closes October 15
  return {
    startDate: `${year}-06-12`,
    endDate: `${year}-10-15`,
  };
}

/**
 * Determine share type and bouquet count from the Stripe product ID.
 */
function resolveShareInfo(productId: string): {
  shareType: "weekly" | "biweekly" | "one-time";
  bouquetCount: string;
  shareTag: string;
} {
  if (productId === "weekly-bloom-share") {
    return { shareType: "weekly", bouquetCount: "12", shareTag: "csa-weekly" };
  }
  if (productId === "biweekly-bloom-share") {
    return { shareType: "biweekly", bouquetCount: "6", shareTag: "csa-biweekly" };
  }
  return { shareType: "one-time", bouquetCount: "1", shareTag: "csa-one-time" };
}

// ─── Main handlers ────────────────────────────────────────────────────────────

/**
 * Called after a successful checkout.session.completed event.
 * Creates or updates the GHL contact with all CSA tags and custom fields.
 */
export async function handleCheckoutCompletedGHL(
  session: Stripe.Checkout.Session
): Promise<void> {
  const locationId = process.env.GHL_LOCATION_ID || "";
  if (!locationId || !process.env.GHL_API_KEY) {
    console.warn("[GHL] Skipping — GHL_API_KEY or GHL_LOCATION_ID not configured");
    return;
  }

  const email =
    session.customer_email ||
    session.metadata?.customer_email ||
    "";

  if (!email) {
    console.warn("[GHL] Skipping — no customer email in session");
    return;
  }

  const productId = session.metadata?.product_id || "";
  const productType = session.metadata?.product_type || "bouquet";
  // Prefer customer_details.name (filled by Stripe at checkout) over metadata fallback.
  // metadata.customer_name is only present when the server explicitly sets it.
  const customerName =
    session.customer_details?.name ||
    session.metadata?.customer_name ||
    "";
  const isGift = session.metadata?.is_gift === "true";
  const giftRecipient = session.metadata?.gift_recipient || "";
  const giftMessage = session.metadata?.gift_message || "";
  const newsletterOptIn = session.metadata?.newsletter_opt_in === "true";

  const { firstName, lastName } = splitName(customerName);
  const { shareType, bouquetCount, shareTag } = resolveShareInfo(productId);
  const { startDate, endDate } = csaSeasonDates();

  const isCSA = productType === "subscription";

  // ── Build tag list ──────────────────────────────────────────────────────────
  const tags: string[] = [];

  if (isCSA) {
    tags.push("csa-member", shareTag);
  } else {
    tags.push("harvest-stand-buyer");
  }

  if (newsletterOptIn) tags.push("newsletter-opt-in");
  if (isGift) tags.push("csa-gift");

  // customer-new vs customer-returning is determined after lookup below

  // ── Build custom fields ─────────────────────────────────────────────────────
  const customField: Record<string, string> = {
    stripe_session_id: session.id,
    newsletter_opt_in: newsletterOptIn ? "true" : "false",
  };

  if (isCSA) {
    customField.csa_share_type = shareType;
    customField.csa_start_date = startDate;
    customField.csa_end_date = endDate;
    customField.csa_bouquet_count = bouquetCount;
    customField.csa_pickup_location = "OKC Metro";
    customField.csa_next_pickup_date = startDate; // first pickup = season start
  }

  if (isGift) {
    customField.is_gift = "true";
    customField.gift_recipient_name = giftRecipient;
    customField.gift_message = giftMessage;
  }

  // ── Upsert contact ──────────────────────────────────────────────────────────
  const existing = await findContactByEmail(email);

  if (existing) {
    // Returning member — add new tags without overwriting existing ones
    const newTags = [...tags, "customer-returning"];
    // Remove csa-lapsed if present (they re-purchased)
    await addTagsToContact(existing.id, newTags);
    await updateContactFields(existing.id, customField);
    // Update name fields if we have them (backfills contacts that had no name before)
    if (firstName) {
      const res = await fetch(`https://services.leadconnectorhq.com/contacts/${existing.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.GHL_API_KEY}`,
          Version: "2021-07-28",
          "Content-Type": "application/json",
        },
        // GHL v2 PUT does NOT accept locationId in the body
        body: JSON.stringify({ firstName, lastName }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.warn("[GHL] Failed to update name on returning contact:", errText);
      }
    }
    console.log(`[GHL] Updated returning contact ${existing.id} (${email})`);
  } else {
    // New member — create contact with all tags
    const allTags = [...tags, "customer-new"];
    const contactId = await createContact({
      locationId,
      firstName,
      lastName,
      email,
      tags: allTags,
      customFields: Object.entries(customField).map(([key, field_value]) => ({ key, field_value })),
      source: "stripe-csa-purchase",
    });
    if (contactId) {
      console.log(`[GHL] Created new contact ${contactId} (${email})`);
    }
  }

  // ── Gift recipient contact ──────────────────────────────────────────────────
  // If this is a gift, create a separate contact for the recipient so they
  // receive the gift-recipient onboarding sequence (OV-B).
  if (isGift && giftRecipient) {
    const recipientEmail = session.metadata?.gift_recipient_email || "";
    if (recipientEmail) {
      const recipientExists = await findContactByEmail(recipientEmail);
      const recipientTags = ["csa-gift-recipient", "customer-new"];
      if (isCSA) recipientTags.push(shareTag);
      if (newsletterOptIn) recipientTags.push("newsletter-opt-in");

      const recipientFields: Record<string, string> = {
        ...customField,
        is_gift: "true",
        gift_giver_email: email,
        gift_giver_name: customerName,
      };

      if (recipientExists) {
        await addTagsToContact(recipientExists.id, recipientTags);
        await updateContactFields(recipientExists.id, recipientFields);
        console.log(`[GHL] Updated gift recipient contact ${recipientExists.id}`);
      } else {
        const { firstName: rFirst, lastName: rLast } = splitName(giftRecipient);
        const recipientId = await createContact({
          locationId,
          firstName: rFirst,
          lastName: rLast,
          email: recipientEmail,
          tags: recipientTags,
          customFields: Object.entries(recipientFields).map(([key, field_value]) => ({ key, field_value })),
          source: "stripe-csa-gift-recipient",
        });
        if (recipientId) {
          console.log(`[GHL] Created gift recipient contact ${recipientId}`);
        }
      }
    }
  }
}

/**
 * Called when a payment_intent.payment_failed event is received.
 * Applies the payment-failed tag so the OV-C recovery workflow fires in GHL.
 */
export async function handlePaymentFailedGHL(
  paymentIntent: Stripe.PaymentIntent
): Promise<void> {
  const locationId = process.env.GHL_LOCATION_ID || "";
  if (!locationId || !process.env.GHL_API_KEY) {
    console.warn("[GHL] Skipping payment-failed — GHL not configured");
    return;
  }

  // Stripe PaymentIntent doesn't always carry email — try charges expand
  const email =
    (paymentIntent as unknown as { receipt_email?: string }).receipt_email ||
    paymentIntent.metadata?.customer_email ||
    "";

  if (!email) {
    console.warn("[GHL] payment_intent.payment_failed — no email, skipping GHL tag");
    return;
  }

  const existing = await findContactByEmail(email);
  if (existing) {
    await addTagsToContact(existing.id, ["payment-failed"]);
    console.log(`[GHL] Applied payment-failed tag to contact ${existing.id}`);
  } else {
    // Contact doesn't exist yet — create a minimal record so OV-C can fire
    const contactId = await createContact({
      locationId,
      firstName: "",
      lastName: "",
      email,
      tags: ["payment-failed", "customer-new"],
      customFields: [{ key: "stripe_payment_intent_id", field_value: paymentIntent.id }],
      source: "stripe-payment-failed",
    });
    if (contactId) {
      console.log(`[GHL] Created payment-failed contact ${contactId}`);
    }
  }
}
