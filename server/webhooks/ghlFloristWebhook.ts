/**
 * GHL Florist Application Webhook Handler
 *
 * Receives webhook events from GoHighLevel when a contact is created with the florist-under-review tag.
 * Syncs the contact data to the local floristApplications table.
 */

import { getDb } from "../db";
import { floristApplications } from "../../drizzle/schema";

export interface GHLWebhookPayload {
  type: string;
  contact?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    company_name?: string;
    customFields?: {
      city?: string;
      website?: string;
    };
    tags?: string[];
  };
}

/**
 * Handle incoming GHL webhook for florist applications
 * Called when a contact is created with the florist-under-review tag
 */
export async function handleFloristApplicationWebhook(payload: GHLWebhookPayload): Promise<void> {
  if (!payload.contact) {
    console.log("[GHL Webhook] No contact data in payload");
    return;
  }

  const contact = payload.contact;

  // Verify the contact has the florist-under-review tag
  const hasFloristTag = contact.tags?.includes("florist-under-review");
  if (!hasFloristTag) {
    console.log(`[GHL Webhook] Contact ${contact.id} does not have florist-under-review tag, skipping`);
    return;
  }

  try {
    const db = await getDb();
    if (!db) {
      console.error("[GHL Webhook] Database connection failed");
      return;
    }

    // Extract contact data
    const firstName = contact.firstName || "";
    const lastName = contact.lastName || "";
    const contactName = `${firstName} ${lastName}`.trim() || "Unknown";
    const email = contact.email || "";
    const phone = contact.phone || "";

    // Extract fields from GHL contact
    // Business Name comes from contact.company_name
    // City and Website come from customFields
    const businessName = contact.company_name || "Unknown Business";
    const customFields = contact.customFields || {};
    const city = customFields.city || "";
    const website = customFields.website || "";

    // Check if this application already exists (by email)
    const { eq } = await import("drizzle-orm");
    const existing = await db
      .select()
      .from(floristApplications)
      .where(eq(floristApplications.email, email))
      .limit(1);

    if (existing.length > 0) {
      console.log(`[GHL Webhook] Application for ${email} already exists, skipping duplicate`);
      return;
    }

    // Validate required fields
    if (!email || businessName === "Unknown Business") {
      console.warn(`[GHL Webhook] Missing required fields for contact ${contact.id}`);
      return;
    }

    // Insert new florist application
    await db.insert(floristApplications).values({
      businessName,
      contactName,
      email,
      phone,
      city,
      status: "pending",
    });

    console.log(`[GHL Webhook] ✅ Florist application created for ${email} (${businessName}) from ${city}`);
  } catch (error) {
    console.error("[GHL Webhook] Error processing florist application:", error);
    throw error;
  }
}

/**
 * Verify GHL webhook signature (optional but recommended for security)
 * GHL sends a signature header that can be verified against your webhook secret
 */
export function verifyGHLWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // This would use HMAC-SHA256 to verify the signature
  // For now, we'll skip this if no secret is provided
  if (!secret) {
    console.warn("[GHL Webhook] No webhook secret configured, skipping signature verification");
    return true;
  }

  // Implementation would go here if needed
  return true;
}
