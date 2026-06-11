# Red Dirt Blooms — GoHighLevel Automation Guide

**Version:** 1.0 · **Date:** June 2026  
**Scope:** All GHL workflows, tags, pipelines, and automations for the Red Dirt Blooms florist and customer ecosystem.

---

## Overview

This guide documents every automation that should be configured in GoHighLevel (GHL) to support the Red Dirt Blooms operation. The site handles form submissions, florist applications, Bloom Watch signups, and order confirmations — GHL is responsible for all follow-up communication, pipeline management, and relationship nurturing.

The architecture is simple: **the website fires a webhook or tag to GHL, and GHL handles everything after that.** No manual emails. No missed follow-ups.

---

## 1. Tags Reference

Every contact in GHL should be tagged at the point of entry. Tags drive automation triggers and allow you to segment your list cleanly.

| Tag | Applied When | Purpose |
|---|---|---|
| `florist-applicant` | Florist submits application form | Triggers florist review workflow |
| `florist-approved` | You approve in `/admin` | Unlocks florist portal, triggers welcome email |
| `florist-declined` | You decline in `/admin` | Triggers polite decline email |
| `bloom-watch` | Customer signs up for Bloom Watch | Triggers harvest notification workflow |
| `bloom-watch-zinnia` | Signed up for zinnia alerts | Variety-specific segmentation |
| `bloom-watch-dahlia` | Signed up for dahlia alerts | Variety-specific segmentation |
| `bloom-watch-sunflower` | Signed up for sunflower alerts | Variety-specific segmentation |
| `bloom-watch-gomphrena` | Signed up for gomphrena alerts | Variety-specific segmentation |
| `csa-subscriber` | Purchases a Bloom Box subscription | Triggers CSA onboarding workflow |
| `csa-4week` | Purchases 4-week Bloom Box | Subscription tier tracking |
| `csa-8week` | Purchases 8-week Bloom Box | Subscription tier tracking |
| `harvest-customer` | Places a one-time order | Triggers post-purchase workflow |
| `bouquet-bar-inquiry` | Submits Bouquet Bar request | Triggers custom order workflow |
| `contact-form` | Submits general contact form | Triggers general inquiry response |

---

## 2. Pipelines

### Pipeline 1: Florist Applications

**Purpose:** Track every florist application from submission through approval or decline.

| Stage | Description |
|---|---|
| New Application | Auto-populated when `florist-applicant` tag fires |
| Under Review | Move manually after reading the application |
| Approved | Move when you click Approve in `/admin` |
| Declined | Move when you click Decline in `/admin` |
| Active Florist | Move after florist logs in for the first time |

### Pipeline 2: CSA Subscribers

**Purpose:** Track Bloom Box subscribers through the full subscription lifecycle.

| Stage | Description |
|---|---|
| New Subscriber | Auto-populated on purchase |
| Onboarding | Receiving welcome sequence |
| Active | Receiving weekly boxes |
| Renewal Due | Within 2 weeks of subscription end |
| Renewed | Purchased again |
| Churned | Did not renew |

### Pipeline 3: Harvest Orders

**Purpose:** Track one-time harvest stand orders.

| Stage | Description |
|---|---|
| Order Received | Auto-populated on purchase |
| Preparing | You are cutting and bunching |
| Ready | Awaiting pickup or delivery |
| Fulfilled | Completed |

---

## 3. Workflows

### Workflow 1: Florist Application — Auto-Reply

**Trigger:** Tag `florist-applicant` is added to a contact.

**Goal:** Confirm receipt immediately so the applicant knows their form went through.

**Steps:**

1. **Wait:** 0 minutes (immediate)
2. **Send Email:**
   - **Subject:** `Your Red Dirt Blooms Florist Application — We Got It`
   - **Body:**
     > Hi {{contact.first_name}},
     >
     > Thank you for applying to the Red Dirt Blooms Wholesale Florist Program. We've received your application and will review it within 48 hours.
     >
     > We review each application personally to make sure the program is a good fit for both sides. You'll hear back from us with a decision by email.
     >
     > In the meantime, feel free to browse what's currently growing at [reddirtblooms.ai/whats-in-the-ground](https://reddirtblooms.ai/whats-in-the-ground).
     >
     > — Lance Neely, Red Dirt Blooms

3. **Add to Pipeline:** Florist Applications → Stage: New Application
4. **Notify Owner (Internal):** Send SMS or email to Lance: `New florist application from {{contact.full_name}} — {{contact.company_name}}. Review at reddirtblooms.ai/admin`

---

### Workflow 2: Florist Application — Approved

**Trigger:** Tag `florist-approved` is added to a contact.

**Goal:** Welcome the florist, deliver login instructions, and set expectations.

**Steps:**

1. **Wait:** 0 minutes (immediate)
2. **Move Pipeline:** Florist Applications → Stage: Approved
3. **Send Email:**
   - **Subject:** `Welcome to Red Dirt Blooms Wholesale — You're In`
   - **Body:**
     > Hi {{contact.first_name}},
     >
     > Great news — your application to the Red Dirt Blooms Wholesale Florist Program has been approved.
     >
     > **Your next step:** Log in to your florist portal at [reddirtblooms.ai/florist-portal](https://reddirtblooms.ai/florist-portal) using the email address you applied with.
     >
     > **What you get access to:**
     > - Early harvest notifications before the public sees them
     > - Wholesale pricing on bunches and bulk orders
     > - Direct ordering through the portal
     >
     > **How it works:**
     > When a new harvest is ready, you'll receive an email notification. Log in to the portal to see availability, pricing, and place your order. Orders are first-come, first-served.
     >
     > If you have any questions, reply to this email or reach out directly.
     >
     > Welcome to the program.
     >
     > — Lance Neely, Red Dirt Blooms

4. **Send SMS (optional):**
   > Hi {{contact.first_name}}, you're approved for Red Dirt Blooms wholesale. Check your email for login instructions. — Lance

5. **Wait:** 3 days
6. **Send Follow-Up Email:**
   - **Subject:** `Have you logged in yet? — Red Dirt Blooms`
   - **Body:**
     > Hi {{contact.first_name}},
     >
     > Just checking in — have you had a chance to log in to your florist portal yet? Your login is at [reddirtblooms.ai/florist-portal](https://reddirtblooms.ai/florist-portal).
     >
     > The first harvest notifications of the season will go out soon. You'll want to be set up before then.
     >
     > — Lance

---

### Workflow 3: Florist Application — Declined

**Trigger:** Tag `florist-declined` is added to a contact.

**Goal:** Close the loop professionally, leave the door open for the future.

**Steps:**

1. **Wait:** 0 minutes (immediate)
2. **Move Pipeline:** Florist Applications → Stage: Declined
3. **Send Email:**
   - **Subject:** `Red Dirt Blooms Florist Program — Application Update`
   - **Body:**
     > Hi {{contact.first_name}},
     >
     > Thank you for your interest in the Red Dirt Blooms Wholesale Florist Program.
     >
     > After reviewing your application, we're not able to offer a spot in the program at this time. Our wholesale capacity is limited by what we can grow, and we're being selective about program fit in this first season.
     >
     > This isn't a permanent decision. As the farm grows, so will the program. If you'd like to be considered again in a future season, you're welcome to reapply.
     >
     > In the meantime, you're welcome to shop the public harvest stand at [reddirtblooms.ai/harvest-stand](https://reddirtblooms.ai/harvest-stand).
     >
     > Thank you again for your interest.
     >
     > — Lance Neely, Red Dirt Blooms

---

### Workflow 4: Bloom Watch Signup

**Trigger:** Tag `bloom-watch` is added to a contact.

**Goal:** Confirm signup, set expectations, deliver first value.

**Steps:**

1. **Wait:** 0 minutes (immediate)
2. **Send Email:**
   - **Subject:** `You're on Bloom Watch — Here's What Happens Next`
   - **Body:**
     > Hi {{contact.first_name}},
     >
     > You're signed up for Bloom Watch at Red Dirt Blooms.
     >
     > Here's how it works: when a new variety hits peak bloom and is ready to cut, you'll get an email before it goes public. That's it. No spam. Just flowers.
     >
     > **What's currently growing:**
     > Zinnias, dahlias, sunflowers, gomphrena, marigolds, and celosia are all in the ground right now. The first notifications will go out when the first harvests are ready.
     >
     > You can see what's growing at any time: [reddirtblooms.ai/whats-in-the-ground](https://reddirtblooms.ai/whats-in-the-ground)
     >
     > — Lance Neely, Red Dirt Blooms

3. **Wait:** 7 days
4. **Send Nurture Email:**
   - **Subject:** `What's happening at the farm this week`
   - **Body:**
     > Hi {{contact.first_name}},
     >
     > Quick update from the field — the zinnias are about two weeks from first cut, and the dahlias are setting buds. It's going to be a good season.
     >
     > If you want to see what's in the ground right now, check the live growing tracker: [reddirtblooms.ai/whats-in-the-ground](https://reddirtblooms.ai/whats-in-the-ground)
     >
     > You'll hear from me when the first harvest is ready.
     >
     > — Lance

---

### Workflow 5: Harvest Notification (Bloom Watch Alert)

**Trigger:** This workflow is triggered manually by you when you publish a harvest and want to notify subscribers. Trigger via GHL broadcast or by tagging contacts with `harvest-ready-[date]`.

**Goal:** Drive traffic to the Harvest Stand before inventory sells out.

**Steps:**

1. **Send Email to Segment:** All contacts tagged `bloom-watch`
   - **Subject:** `New Harvest Ready — {{variety_name}} is Cut and Available`
   - **Body:**
     > Hi {{contact.first_name}},
     >
     > A new harvest is ready at Red Dirt Blooms.
     >
     > **{{variety_name}}** is cut, bunched, and available now. These go fast — first-come, first-served.
     >
     > [Shop the Harvest →](https://reddirtblooms.ai/harvest-stand)
     >
     > Availability is limited. Once it's gone, it's gone until the next cut.
     >
     > — Lance Neely, Red Dirt Blooms

2. **Send SMS (optional, high-value subscribers):**
   > New harvest at Red Dirt Blooms — {{variety_name}} is ready. Shop now before it sells out: reddirtblooms.ai/harvest-stand

**Note:** For variety-specific alerts, filter by the corresponding variety tag (e.g., `bloom-watch-zinnia`) to send targeted notifications.

---

### Workflow 6: CSA / Bloom Box — Onboarding

**Trigger:** Tag `csa-subscriber` is added to a contact (fires from Stripe webhook on successful purchase).

**Goal:** Welcome new CSA subscribers, set expectations for the season.

**Steps:**

1. **Wait:** 0 minutes (immediate)
2. **Send Email:**
   - **Subject:** `Your Bloom Box Subscription is Confirmed — Welcome`
   - **Body:**
     > Hi {{contact.first_name}},
     >
     > Your Bloom Box subscription is confirmed. Welcome to the Red Dirt Blooms CSA.
     >
     > **What happens next:**
     > - You'll receive an email before each delivery window with what's in your box that week
     > - Pickup location and timing will be communicated as the season progresses — we're finalizing a central hub location
     > - If local delivery is available in your area, you'll be notified
     >
     > **Your subscription:**
     > {{subscription_type}} — starting with the first available harvest of the season.
     >
     > Questions? Reply to this email.
     >
     > — Lance Neely, Red Dirt Blooms

3. **Add to Pipeline:** CSA Subscribers → Stage: Onboarding
4. **Wait:** 3 days
5. **Send Email:**
   - **Subject:** `What to expect in your first Bloom Box`
   - **Body:**
     > Hi {{contact.first_name}},
     >
     > Your first Bloom Box will include a mix of whatever is at peak bloom that week. That's the whole point — you get what the farm is producing at its best, not what a warehouse has in stock.
     >
     > Typical first-season boxes include zinnias, sunflowers, and gomphrena. As the season progresses, you'll start seeing dahlias and celosia.
     >
     > I'll send you a heads-up before each box so you know what's coming.
     >
     > — Lance

---

### Workflow 7: One-Time Order — Post-Purchase

**Trigger:** Tag `harvest-customer` is added to a contact (fires from Stripe webhook on successful one-time purchase).

**Goal:** Confirm the order, provide fulfillment info, and invite them back.

**Steps:**

1. **Wait:** 0 minutes (immediate)
2. **Send Email:**
   - **Subject:** `Your Red Dirt Blooms Order — Confirmed`
   - **Body:**
     > Hi {{contact.first_name}},
     >
     > Your order is confirmed. Thank you for supporting a small Oklahoma flower farm.
     >
     > **Fulfillment:**
     > We're working on establishing a central pickup hub — you'll receive a separate email with pickup details as soon as that's finalized. Local delivery may be available depending on your location.
     >
     > If you have any questions about your order, reply to this email.
     >
     > — Lance Neely, Red Dirt Blooms

3. **Wait:** 5 days
4. **Send Follow-Up Email:**
   - **Subject:** `How were your flowers? — Red Dirt Blooms`
   - **Body:**
     > Hi {{contact.first_name}},
     >
     > Hoping your flowers are still going strong. Fresh-cut Oklahoma zinnias and sunflowers typically last 7–12 days with a clean cut and fresh water every couple of days.
     >
     > If you enjoyed them, consider signing up for a Bloom Box — it's the easiest way to get fresh flowers on a regular schedule: [reddirtblooms.ai/csa](https://reddirtblooms.ai/csa)
     >
     > — Lance

5. **Wait:** 14 days
6. **Send Re-engagement Email:**
   - **Subject:** `New varieties are ready — come back to the Harvest Stand`
   - **Body:**
     > Hi {{contact.first_name}},
     >
     > A few new varieties have hit the stand since your last order. Come see what's available: [reddirtblooms.ai/harvest-stand](https://reddirtblooms.ai/harvest-stand)
     >
     > — Lance

---

### Workflow 8: Bouquet Bar Inquiry

**Trigger:** Tag `bouquet-bar-inquiry` is added to a contact (fires from Bouquet Bar form submission).

**Goal:** Acknowledge the custom order request and set a response timeline.

**Steps:**

1. **Wait:** 0 minutes (immediate)
2. **Send Email:**
   - **Subject:** `Your Bouquet Bar Request — Red Dirt Blooms`
   - **Body:**
     > Hi {{contact.first_name}},
     >
     > Thank you for submitting a Bouquet Bar request. I've received your order details and will follow up within 24 hours to confirm availability and finalize the arrangement.
     >
     > Custom orders are fulfilled based on what's at peak bloom at the time of your event. I'll reach out to discuss options and confirm the details.
     >
     > — Lance Neely, Red Dirt Blooms

3. **Notify Owner (Internal):** Send SMS to Lance: `New Bouquet Bar request from {{contact.full_name}}. Check admin panel.`

---

## 4. Broadcast Templates

These are one-off broadcasts you'll send manually throughout the season. Save them as templates in GHL so you can fire them quickly.

### Broadcast: Season Opening

**Segment:** All contacts  
**Subject:** `Red Dirt Blooms Season 1 is Open`

> Hi {{contact.first_name}},
>
> Season 1 at Red Dirt Blooms is officially underway. The first seeds are in the ground, and the first harvests are about a month out.
>
> If you haven't already, sign up for Bloom Watch to be the first to know when flowers are ready: [reddirtblooms.ai](https://reddirtblooms.ai)
>
> — Lance

### Broadcast: First Harvest of the Season

**Segment:** `bloom-watch`  
**Subject:** `First harvest of the season — it's here`

> Hi {{contact.first_name}},
>
> The first harvest of Season 1 is ready. This is what we've been working toward.
>
> Shop now — these go fast: [reddirtblooms.ai/harvest-stand](https://reddirtblooms.ai/harvest-stand)
>
> — Lance

### Broadcast: End of Season

**Segment:** All contacts  
**Subject:** `Season 1 is wrapping up — thank you`

> Hi {{contact.first_name}},
>
> Season 1 at Red Dirt Blooms is winding down. It's been a great first year — we grew {{variety_count}} varieties, cut {{bunch_count}} bunches, and shipped Bloom Boxes to {{subscriber_count}} households.
>
> Season 2 planning is already underway. If you want to be first in line for CSA subscriptions and wholesale spots next year, stay on the list.
>
> Thank you for being part of this.
>
> — Lance Neely, Red Dirt Blooms

---

## 5. Implementation Checklist

Work through this list in GHL to get all automations live:

**Tags:**
- [ ] Create all tags listed in Section 1
- [ ] Verify `florist-applicant` tag fires when florist form is submitted (test with a real submission)
- [ ] Verify `bloom-watch` tag fires when Bloom Watch form is submitted

**Pipelines:**
- [ ] Create Florist Applications pipeline with all 5 stages
- [ ] Create CSA Subscribers pipeline with all 6 stages
- [ ] Create Harvest Orders pipeline with all 4 stages

**Workflows:**
- [ ] Build and activate Workflow 1: Florist Application Auto-Reply
- [ ] Build and activate Workflow 2: Florist Approved
- [ ] Build and activate Workflow 3: Florist Declined
- [ ] Build and activate Workflow 4: Bloom Watch Signup
- [ ] Build Workflow 5: Harvest Notification (manual trigger, keep as draft until first harvest)
- [ ] Build and activate Workflow 6: CSA Onboarding
- [ ] Build and activate Workflow 7: One-Time Order Post-Purchase
- [ ] Build and activate Workflow 8: Bouquet Bar Inquiry

**Broadcasts:**
- [ ] Save Season Opening broadcast as template
- [ ] Save First Harvest broadcast as template
- [ ] Save End of Season broadcast as template

**Testing:**
- [ ] Submit a test florist application and verify auto-reply fires
- [ ] Approve the test contact in `/admin` and verify approval email fires
- [ ] Submit a test Bloom Watch signup and verify confirmation email fires
- [ ] Place a test order and verify post-purchase email fires

---

## 6. Webhook Configuration

The Red Dirt Blooms site sends data to GHL via the GHL Forms API. The following data is sent with each form submission:

**Florist Application:**
- `firstName`, `lastName`, `email`, `phone`
- `businessName`, `businessType`, `city`, `state`
- `monthlyBudget`, `designStyle`, `hearAboutUs`
- Tags applied: `florist-applicant`

**Bloom Watch Signup:**
- `email`, `name` (optional), `variety` (if selected)
- Tags applied: `bloom-watch`, `bloom-watch-[variety]` (if variety selected)

**Contact Form:**
- `firstName`, `lastName`, `email`, `phone`, `message`
- Tags applied: `contact-form`

**Bouquet Bar Request:**
- `name`, `email`, `phone`, `eventDate`, `stemCount`, `colorPalette`, `notes`
- Tags applied: `bouquet-bar-inquiry`

All webhooks use your configured `GHL_API_KEY` and `GHL_LOCATION_ID` environment variables.

---

## 7. Notes and Best Practices

**Keep it personal.** Every email above is written in first person from Lance. GHL makes it easy to automate, but the tone should never feel automated. Short, direct, and human beats long and corporate every time.

**Don't over-automate the first season.** The workflows above cover the critical paths. Resist the urge to add 10-step nurture sequences before you have real data on what your customers respond to. Start simple, measure, then expand.

**SMS is optional but powerful.** For high-value triggers (florist approval, first harvest notification), SMS gets opened. For routine confirmations, email is sufficient. Don't spam SMS.

**Segment before you broadcast.** Always filter by the relevant tag before sending a broadcast. Sending a "first harvest ready" email to someone who never signed up for Bloom Watch is a fast way to get unsubscribes.

**Review the florist pipeline weekly.** During active season, check the Florist Applications pipeline every Monday. Applications that sit in "New Application" for more than 3 days create a bad first impression.
