# GHL API Approach — Red Dirt Blooms

## Architecture Decision: Pull-Based vs Webhook

Red Dirt Blooms uses a **pull-based** GHL integration instead of webhooks. This was a deliberate decision made after evaluating both approaches.

### Why Pull-Based (Not Webhooks)

| Factor | Webhook | Pull-Based (Current) |
|---|---|---|
| Setup complexity | High (requires public URL, secret validation, retry logic) | Low (just an API key) |
| Reliability | Depends on GHL delivery, can miss events | Always reads live state |
| Debugging | Hard (events are fire-and-forget) | Easy (just call the API) |
| Local dev | Requires ngrok or tunnel | Works out of the box |
| Data freshness | Real-time (but can lag) | On-demand (always current) |

For a micro farm with low volume, pull-based is simpler, more reliable, and easier to maintain.

---

## How It Works

### Florist Application Flow

1. **Florist submits application** on the website (`/florist-portal` → Apply tab)
2. **Server inserts into `floristApplications` table** and sends a Manus owner notification
3. **Admin goes to `/admin`** → Florist Applications tab
4. **Admin clicks Approve** → server calls `updateFloristStatusInGHL()` to tag the contact in GHL, then creates a `floristAccounts` record with a temporary password
5. **Admin relays credentials** to florist via email (or GHL automation)
6. **Florist logs in** at `/florist-login` using their email + password

### GHL Contact Tagging

When a florist is approved or declined, the server updates their GHL contact:

```ts
// server/ghl.ts
await updateFloristStatusInGHL(email, "approved");
// → Adds tag: "florist-approved"
// → Removes tag: "florist-applicant"
```

When declined:
```ts
await updateFloristStatusInGHL(email, "declined");
// → Adds tag: "florist-declined"
// → Removes tag: "florist-applicant"
```

### Admin Florist Apps Query

The admin dashboard fetches florist applications directly from GHL:

```ts
// server/ghlApi.ts
const contacts = await getGHLFloristApplications();
// → Queries GHL contacts with tag "florist-applicant"
// → Falls back to local DB if GHL API fails
```

---

## Environment Variables Required

| Variable | Description |
|---|---|
| `GHL_API_KEY` | GoHighLevel API key (v1) — found in GHL → Settings → API |
| `GHL_LOCATION_ID` | Your GHL sub-account location ID |

Both are already configured in the deployed environment.

---

## GHL Tags Used

| Tag | Meaning |
|---|---|
| `florist-applicant` | Application submitted, pending review |
| `florist-approved` | Approved — has login access |
| `florist-declined` | Declined — no access |
| `bloom-watch` | Subscribed to Bloom Watch email list |
| `order-placed` | Placed an order through the website |

---

## Files

| File | Purpose |
|---|---|
| `server/ghl.ts` | `updateFloristStatusInGHL()` — updates tags on approval/decline |
| `server/ghlApi.ts` | `getGHLFloristApplications()` — pulls pending apps from GHL |
| `server/routers.ts` | `admin.getFloristApps` — uses ghlApi, falls back to local DB |
| `server/routers.ts` | `admin.updateFloristStatus` — calls ghl.ts on approve/decline |

---

## Removed (Cleanup Round 35)

The following webhook infrastructure was removed because it was superseded by the pull-based approach:

- `server/ghlWebhookHandler.ts` — Express webhook handler (removed)
- `server/webhooks/ghlFloristWebhook.ts` — Webhook payload processor (removed)
- `server/routers/ghlWebhook.ts` — tRPC webhook router (removed)
- `POST /api/ghl/webhook/florist-app` — Express route (removed)

The `floristApplications` table remains in the schema as a fallback data source when GHL API is unavailable.

---

## GHL Automation Recommendations

Set up these automations in GHL to complete the florist onboarding loop:

1. **Trigger:** Contact gets tag `florist-approved`
   **Action:** Send email with login credentials (use custom fields for email/password)

2. **Trigger:** Contact gets tag `florist-declined`
   **Action:** Send polite decline email with option to reapply next season

3. **Trigger:** Contact gets tag `bloom-watch`
   **Action:** Add to Bloom Watch email list, send welcome email

See `GHL-Email-Templates-and-Workflow-Guide.md` for ready-to-paste email templates for all these scenarios.
