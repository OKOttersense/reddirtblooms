/**
 * GoHighLevel CRM sync helper (v2 API)
 * Pushes contacts to GHL and keeps tags in sync.
 */

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

function ghlHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_API_KEY}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };
}

/** Look up a contact by email in GHL v2. Returns the contact id or null. */
async function findContactByEmail(email: string): Promise<string | null> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId) return null;

  try {
    const url = `${GHL_BASE}/contacts/search`;
    const res = await fetch(url, {
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

    const data = (await res.json()) as { contacts?: { id: string }[] };
    return data.contacts?.[0]?.id ?? null;
  } catch (err) {
    console.error("[GHL] Contact search error:", err);
    return null;
  }
}

/**
 * Create or update a florist contact in GHL.
 * Called on registration — creates the contact with the florist-under-review tag.
 */
export async function syncFloristToGHL(florist: {
  email: string;
  contactName: string;
  businessName: string;
  phone?: string | null;
  city?: string | null;
  website?: string | null;
  status: "pending" | "approved" | "declined";
}): Promise<string | null> {
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  const apiKey = process.env.GHL_API_KEY?.trim();

  if (!locationId || !apiKey) {
    console.error("[GHL] CRITICAL: Missing credentials. GHL_API_KEY or GHL_LOCATION_ID not configured.");
    console.error("[GHL] locationId:", locationId ? "set" : "MISSING");
    console.error("[GHL] apiKey:", apiKey ? "set" : "MISSING");
    return null;
  }

  const nameParts = florist.contactName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const tag = statusToTag(florist.status);

  const payload: Record<string, unknown> = {
    locationId,
    firstName,
    lastName,
    email: florist.email,
    companyName: florist.businessName,
    tags: [tag, "florist-portal"],
    source: "Red Dirt Blooms Website",
  };

  if (florist.phone) payload.phone = florist.phone;
  if (florist.city) payload.city = florist.city;
  if (florist.website) payload.website = florist.website;

  try {
    console.log("[GHL] Starting sync for:", florist.email);

    const existingId = await findContactByEmail(florist.email);
    console.log("[GHL] Existing contact check:", existingId ? "found" : "not found");

    if (existingId) {
      // GHL v2 PUT does NOT accept locationId in the body — strip it
      const { locationId: _loc, ...updatePayload } = payload as Record<string, unknown>;
      void _loc;
      const res = await fetch(`${GHL_BASE}/contacts/${existingId}`, {
        method: "PUT",
        headers: ghlHeaders(),
        body: JSON.stringify(updatePayload),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("[GHL] Update contact failed:", res.status, err);
        return null;
      }
      // GHL PUT merges tags — it does NOT remove old ones.
      // Explicitly DELETE the stale status tags so only the current status tag remains.
      const allStatusTags = ["florist-under-review", "florist-approved", "florist-declined"];
      const tagsToRemove = allStatusTags.filter((t) => t !== tag);
      for (const staleTag of tagsToRemove) {
        await fetch(`${GHL_BASE}/contacts/${existingId}/tags`, {
          method: "DELETE",
          headers: ghlHeaders(),
          body: JSON.stringify({ tags: [staleTag] }),
        });
      }
      console.log("[GHL] Updated contact:", existingId, "| active tag:", tag);
      return existingId;
    } else {
      const res = await fetch(`${GHL_BASE}/contacts/`, {
        method: "POST",
        headers: ghlHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json() as { message?: string; meta?: { contactId?: string } };
        // GHL returns the existing contact ID in meta.contactId when blocking a duplicate.
        // Use it to update the existing contact instead of failing.
        const duplicateId = errBody?.meta?.contactId;
        if (duplicateId) {
          console.log("[GHL] Duplicate detected — updating existing contact:", duplicateId);
          const { locationId: _loc, ...updatePayload } = payload as Record<string, unknown>;
          void _loc;
          const upRes = await fetch(`${GHL_BASE}/contacts/${duplicateId}`, {
            method: "PUT",
            headers: ghlHeaders(),
            body: JSON.stringify(updatePayload),
          });
          if (!upRes.ok) {
            const upErr = await upRes.text();
            console.error("[GHL] Duplicate update failed:", upRes.status, upErr);
            return null;
          }
          console.log("[GHL] Updated duplicate contact:", duplicateId);
          return duplicateId;
        }
        console.error("[GHL] Create contact failed:", res.status, JSON.stringify(errBody));
        return null;
      }
      const data = (await res.json()) as { contact?: { id: string } };
      const newId = data.contact?.id ?? null;
      console.log("[GHL] Created contact:", newId);
      return newId;
    }
  } catch (err) {
    console.error("[GHL] Sync error:", err);
    return null;
  }
}

/**
 * Update the status tag on an existing GHL contact.
 * Called when admin approves or declines a florist application.
 */
export async function updateFloristStatusInGHL(
  email: string,
  status: "pending" | "approved" | "declined"
): Promise<void> {
  if (!process.env.GHL_API_KEY || !process.env.GHL_LOCATION_ID) return;

  try {
    const contactId = await findContactByEmail(email);
    if (!contactId) {
      console.warn("[GHL] Contact not found for status update:", email);
      return;
    }

    const tag = statusToTag(status);

    const tagsToRemove = ["florist-under-review", "florist-approved", "florist-declined"].filter(
      (t) => t !== tag
    );

    await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
      method: "POST",
      headers: ghlHeaders(),
      body: JSON.stringify({ tags: [tag] }),
    });

    for (const oldTag of tagsToRemove) {
      await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
        method: "DELETE",
        headers: ghlHeaders(),
        body: JSON.stringify({ tags: [oldTag] }),
      });
    }

    console.log(`[GHL] Updated status tag to ${tag} for contact:`, contactId);
  } catch (err) {
    console.error("[GHL] Status update error:", err);
  }
}

/**
 * Create or update a generic contact in GHL with specified tags.
 * Used for Bloom Watch signups, Bouquet Bar inquiries, and Stripe order customers.
 */
export async function syncContactToGHL(contact: {
  email: string;
  name?: string | null;
  phone?: string | null;
  tags: string[];
  source?: string;
  customFields?: Array<{ key: string; field_value: string }>;
}): Promise<string | null> {
  const locationId = process.env.GHL_LOCATION_ID?.trim();
  const apiKey = process.env.GHL_API_KEY?.trim();
  if (!locationId || !apiKey) {
    console.warn("[GHL] Missing credentials — skipping contact sync for:", contact.email);
    return null;
  }
  const nameParts = (contact.name ?? "").trim().split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ") || "";
  const payload: Record<string, unknown> = {
    locationId,
    firstName,
    lastName,
    email: contact.email,
    tags: contact.tags,
    source: contact.source ?? "Red Dirt Blooms Website",
    ...(contact.customFields?.length ? { customFields: contact.customFields } : {}),
  };
  if (contact.phone) payload.phone = contact.phone;
  try {
    const existingId = await findContactByEmail(contact.email);
    if (existingId) {
      // GHL v2 PUT does NOT accept locationId in the body — strip it.
      // Also strip tags: GHL PUT REPLACES the entire tag list, wiping existing tags.
      // Tags must be added via POST /contacts/:id/tags to preserve existing tags.
      const { locationId: _loc, tags: _tags, ...updatePayload } = payload as Record<string, unknown>;
      void _loc; void _tags;
      const res = await fetch(`${GHL_BASE}/contacts/${existingId}`, {
        method: "PUT",
        headers: ghlHeaders(),
        body: JSON.stringify(updatePayload),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("[GHL] Update contact failed:", res.status, err);
        return null;
      }
      // Add new tags via POST so existing tags are preserved (not replaced)
      if (contact.tags.length > 0) {
        await fetch(`${GHL_BASE}/contacts/${existingId}/tags`, {
          method: "POST",
          headers: ghlHeaders(),
          body: JSON.stringify({ tags: contact.tags }),
        });
      }
      console.log(`[GHL] Updated contact ${existingId} | added tags:`, contact.tags);
      return existingId;
    } else {
      const res = await fetch(`${GHL_BASE}/contacts/`, {
        method: "POST",
        headers: ghlHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("[GHL] Create contact failed:", res.status, err);
        return null;
      }
      const data = (await res.json()) as { contact?: { id: string } };
      const newId = data.contact?.id ?? null;
      console.log(`[GHL] Created contact ${newId} with tags:`, contact.tags);
      return newId;
    }
  } catch (err) {
    console.error("[GHL] syncContactToGHL error:", err);
    return null;
  }
}

function statusToTag(status: "pending" | "approved" | "declined"): string {
  switch (status) {
    case "pending":
      return "florist-under-review";
    case "approved":
      return "florist-approved";
    case "declined":
      return "florist-declined";
  }
}

// ─── Florist Application Pipeline ────────────────────────────────────────────
// Pipeline: "Florist Applications" | sxqlrrOTzrDai9NiDV2h
// Stages (in order):
//   New Application  | 4e5f39b1-2834-4f1a-b177-76717ac61d6c
//   Under Review     | b2ea2ee6-128d-44a1-b583-08a92247a8a2
//   Approved         | b6e2e7ca-a866-4aeb-a2b3-270338c85292
//   Declined         | 11c438a6-fb3d-4d30-907d-b6bba19a0a8d
//   Active Florist   | e3e12342-eec4-4c63-8b4e-571f93a15bdc

const FLORIST_PIPELINE_ID = "sxqlrrOTzrDai9NiDV2h";

const FLORIST_STAGE_IDS: Record<"pending" | "approved" | "declined" | "active", string> = {
  pending: "b2ea2ee6-128d-44a1-b583-08a92247a8a2",   // Under Review
  approved: "b6e2e7ca-a866-4aeb-a2b3-270338c85292",  // Approved
  declined: "11c438a6-fb3d-4d30-907d-b6bba19a0a8d",  // Declined
  active: "e3e12342-eec4-4c63-8b4e-571f93a15bdc",    // Active Florist
};

const NEW_APPLICATION_STAGE_ID = "4e5f39b1-2834-4f1a-b177-76717ac61d6c";

function ghlPrivateHeaders() {
  return {
    Authorization: `Bearer ${process.env.GHL_PRIVATE_API_KEY}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
  };
}

/** Find an existing opportunity in the florist pipeline for a given contact. */
async function findFloristOpportunity(contactId: string): Promise<string | null> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId || !process.env.GHL_PRIVATE_API_KEY) return null;
  try {
    const res = await fetch(
      `${GHL_BASE}/opportunities/search?location_id=${locationId}&pipeline_id=${FLORIST_PIPELINE_ID}&contact_id=${contactId}&limit=1`,
      { headers: ghlPrivateHeaders() }
    );
    if (!res.ok) {
      const err = await res.text();
      console.warn("[GHL] Opportunity search failed:", res.status, err);
      return null;
    }
    const data = (await res.json()) as { opportunities?: { id: string }[] };
    return data.opportunities?.[0]?.id ?? null;
  } catch (err) {
    console.error("[GHL] findFloristOpportunity error:", err);
    return null;
  }
}

/**
 * Create a new opportunity in the Florist Applications pipeline.
 * Called when a florist submits their application (status = pending → New Application stage).
 */
export async function createFloristOpportunity(
  contactId: string,
  businessName: string,
  status: "pending" | "approved" | "declined"
): Promise<string | null> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId || !process.env.GHL_PRIVATE_API_KEY) {
    console.warn("[GHL] Missing private API key — skipping opportunity creation");
    return null;
  }
  try {
    // On first submission, always start at "New Application" stage
    const stageId = status === "pending" ? NEW_APPLICATION_STAGE_ID : FLORIST_STAGE_IDS[status];
    const res = await fetch(`${GHL_BASE}/opportunities/`, {
      method: "POST",
      headers: ghlPrivateHeaders(),
      body: JSON.stringify({
        pipelineId: FLORIST_PIPELINE_ID,
        locationId,
        name: `${businessName} — Florist Application`,
        pipelineStageId: stageId,
        status: "open",
        contactId,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[GHL] Create opportunity failed:", res.status, err);
      return null;
    }
    const data = (await res.json()) as { opportunity?: { id: string } };
    const oppId = data.opportunity?.id ?? null;
    console.log("[GHL] Created opportunity:", oppId, "| stage:", stageId);
    return oppId;
  } catch (err) {
    console.error("[GHL] createFloristOpportunity error:", err);
    return null;
  }
}

/**
 * Move an existing florist opportunity to the correct pipeline stage.
 * Called when admin approves or declines an application.
 */
export async function moveFloristOpportunityStage(
  contactId: string,
  businessName: string,
  status: "pending" | "approved" | "declined"
): Promise<void> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId || !process.env.GHL_PRIVATE_API_KEY) {
    console.warn("[GHL] Missing private API key — skipping opportunity stage move");
    return;
  }
  try {
    let oppId = await findFloristOpportunity(contactId);

    // If no opportunity exists yet, create one (handles backfill case)
    if (!oppId) {
      console.log("[GHL] No existing opportunity — creating one for stage move");
      oppId = await createFloristOpportunity(contactId, businessName, status);
      return; // createFloristOpportunity already sets the correct stage
    }

    const stageId = FLORIST_STAGE_IDS[status];
    const res = await fetch(`${GHL_BASE}/opportunities/${oppId}`, {
      method: "PUT",
      headers: ghlPrivateHeaders(),
      body: JSON.stringify({
        pipelineId: FLORIST_PIPELINE_ID,
        pipelineStageId: stageId,
        status: status === "declined" ? "lost" : "open",
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[GHL] Move opportunity stage failed:", res.status, err);
      return;
    }
    console.log("[GHL] Moved opportunity", oppId, "to stage:", stageId, "(", status, ")");
  } catch (err) {
    console.error("[GHL] moveFloristOpportunityStage error:", err);
  }
}

// ─── Bouquet Bar Pipeline ────────────────────────────────────────────────────
// Pipeline ID: oqXWWwrxP30GmEp3DDbi
// Stages:
//   New Inquiry | 200dafcb-dfa8-4bf9-a871-79eca32640f1
//   Quoted      | e3a09ac1-ed40-4120-a475-1d3058161fac
//   Booked      | 3d40f2e1-24e4-46b3-a61e-0bf6b982a3df
//   Completed   | 484159f0-b0ed-4431-b4a6-a1b5e98cfbf8
//   Lost        | 07e01e19-aa55-4dbd-83af-dca146d800bd

const BOUQUET_PIPELINE_ID = "oqXWWwrxP30GmEp3DDbi";
const BOUQUET_STAGE_IDS = {
  new_inquiry: "200dafcb-dfa8-4bf9-a871-79eca32640f1",
  quoted:      "e3a09ac1-ed40-4120-a475-1d3058161fac",
  booked:      "3d40f2e1-24e4-46b3-a61e-0bf6b982a3df",
  completed:   "484159f0-b0ed-4431-b4a6-a1b5e98cfbf8",
  lost:        "07e01e19-aa55-4dbd-83af-dca146d800bd",
} as const;

/** Find an existing opportunity in the Bouquet Bar pipeline for a given contact. */
async function findBouquetOpportunity(contactId: string): Promise<string | null> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId || !process.env.GHL_PRIVATE_API_KEY) return null;
  try {
    const res = await fetch(
      `${GHL_BASE}/opportunities/search?location_id=${locationId}&pipeline_id=${BOUQUET_PIPELINE_ID}&contact_id=${contactId}&limit=1`,
      { headers: ghlPrivateHeaders() }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { opportunities?: { id: string }[] };
    return data.opportunities?.[0]?.id ?? null;
  } catch (err) {
    console.error("[GHL] findBouquetOpportunity error:", err);
    return null;
  }
}

/**
 * Create a new opportunity in the Bouquet Bar pipeline.
 * Called when a visitor submits a bouquet bar inquiry — always starts in "New Inquiry" stage.
 */
export async function createBouquetOpportunity(
  contactId: string,
  contactName: string,
  eventType?: string | null,
  eventDate?: string | null
): Promise<string | null> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId || !process.env.GHL_PRIVATE_API_KEY) {
    console.warn("[GHL] Missing private API key — skipping bouquet opportunity creation");
    return null;
  }
  try {
    const label = [eventType, eventDate].filter(Boolean).join(" — ");
    const name = label
      ? `${contactName} — ${label}`
      : `${contactName} — Bouquet Bar Inquiry`;

    const res = await fetch(`${GHL_BASE}/opportunities/`, {
      method: "POST",
      headers: ghlPrivateHeaders(),
      body: JSON.stringify({
        pipelineId: BOUQUET_PIPELINE_ID,
        locationId,
        name,
        pipelineStageId: BOUQUET_STAGE_IDS.new_inquiry,
        status: "open",
        contactId,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[GHL] Create bouquet opportunity failed:", res.status, err);
      return null;
    }
    const data = (await res.json()) as { opportunity?: { id: string } };
    const oppId = data.opportunity?.id ?? null;
    console.log("[GHL] Created bouquet opportunity:", oppId);
    return oppId;
  } catch (err) {
    console.error("[GHL] createBouquetOpportunity error:", err);
    return null;
  }
}

/**
 * Move a Bouquet Bar opportunity to a new stage.
 * Creates the opportunity first if it doesn't exist yet.
 */
export async function moveBouquetOpportunityStage(
  contactId: string,
  contactName: string,
  stage: keyof typeof BOUQUET_STAGE_IDS,
  eventType?: string | null,
  eventDate?: string | null
): Promise<void> {
  const locationId = process.env.GHL_LOCATION_ID;
  if (!locationId || !process.env.GHL_PRIVATE_API_KEY) return;
  try {
    let oppId = await findBouquetOpportunity(contactId);
    if (!oppId) {
      console.log("[GHL] No bouquet opportunity found — creating one");
      oppId = await createBouquetOpportunity(contactId, contactName, eventType, eventDate);
      if (!oppId) return;
      // If target stage is new_inquiry, creation already set it correctly
      if (stage === "new_inquiry") return;
    }
    const stageId = BOUQUET_STAGE_IDS[stage];
    const res = await fetch(`${GHL_BASE}/opportunities/${oppId}`, {
      method: "PUT",
      headers: ghlPrivateHeaders(),
      body: JSON.stringify({
        pipelineId: BOUQUET_PIPELINE_ID,
        pipelineStageId: stageId,
        status: stage === "lost" ? "lost" : stage === "completed" ? "won" : "open",
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("[GHL] Move bouquet stage failed:", res.status, err);
      return;
    }
    console.log("[GHL] Moved bouquet opportunity", oppId, "to stage:", stage);
  } catch (err) {
    console.error("[GHL] moveBouquetOpportunityStage error:", err);
  }
}
