# Red Dirt Blooms — MVP Critical Path
**Target: Live by 10:00 AM**
*Last updated: June 1, 2026*

---

## The Honest Assessment

The site is further along than most people realize at this stage. The checkout flow is live, Stripe is wired with real price IDs, the florist application flows to GHL, and the admin panel is functional. What stands between you and a working MVP is not code — it is **content, testing, and one Stripe step**.

---

## Must-Have Before 10 AM (Critical Path)

These are the only things that will prevent a real customer from completing a transaction if they are broken.

| # | Item | Status | Action Required |
|---|------|--------|-----------------|
| 1 | **Claim your Stripe sandbox** | Pending | Go to the URL in the earlier Stripe message and claim it. Without this, test payments will not process. |
| 2 | **Test a full checkout end-to-end** | Untested | Go to Harvest Stand → click Buy Now on any product → use card `4242 4242 4242 4242`, any future date, any CVC → confirm you land on `/order-success` |
| 3 | **Test a Bloom Share checkout** | Untested | Go to CSA page → click Reserve My Share → complete test payment → confirm success page |
| 4 | **Test the florist application** | Confirmed working | Already verified in GHL — no action needed |
| 5 | **Publish the site** | Pending | Click the Publish button in the Manus management UI (requires the checkpoint already saved) |

That is the entire critical path. Five items. Two are tests, one is a button click.

---

## What Is Already Working

| Feature | Status |
|---|---|
| Home page with correct photos | Live |
| Harvest Stand with filters | Live |
| Buy Now / Add to Cart / Checkout | Live — Stripe price IDs populated |
| Order Success page | Live |
| Stripe webhook handler | Live — saves orders to DB |
| CSA / Bloom Share page with checkout | Live |
| Florist application → GHL | Live — confirmed |
| Florist portal (login, ordering, invoicing) | Live |
| Bouquet Bar inquiry form | Live |
| What's in the Ground with filters | Live |
| Gallery with varieties view and share | Live |
| Admin panel (all 4 tabs) | Live |
| Bloom Watch email capture | Live |
| Come Find Us (no address, no pickup hours) | Live |
| Roots & Story with correct photo | Live |

---

## What Is Deferred (Season 2 or Post-Launch)

These are intentionally not on the critical path. Do not touch them before launch.

| Item | Why Deferred |
|---|---|
| Dried flower products | Season 2 — removed from store |
| Real farm photos in Gallery | Upload through admin panel when you have them |
| GHL automation workflows | Build in GHL after launch — guide is written |
| Confirmation dialog on admin (just added) | Works, no testing required before launch |
| Preview feature on admin | Works, no testing required before launch |
| Subscriber export CSV | Works, test post-launch |
| Central pickup hub announcement | Announce when you have a location |
| Delivery radius map | Post-launch |

---

## Launch Day Sequence (10 AM)

Execute in this exact order:

1. **Claim Stripe sandbox** (5 minutes) — do this first so test payments work
2. **Run test checkout** on Harvest Stand (5 minutes)
3. **Run test checkout** on CSA page (5 minutes)
4. **Spot-check on mobile** — open the site on your phone and tap through Home → Harvest Stand → CSA → Florist App (10 minutes)
5. **Click Publish** in Manus management UI

Total time: 25 minutes.

---

## Post-Launch Week 1 Priorities

Once the site is live, these are the highest-leverage next actions in order:

1. **Build GHL workflows** — use the automation guide in `references/ghl-automation-guide.md`. Start with Workflow 1 (florist auto-reply) and Workflow 6 (Bloom Watch signup confirmation). These two alone will make you look professional immediately.
2. **Upload real farm photos** — go to `/admin` → Gallery Manager → upload photos and tag them. This is the single biggest trust signal you can add.
3. **Write 2–3 Bloom Diary posts** — even short ones. "What's germinating this week" takes 10 minutes and builds the email list.
4. **Announce the pickup hub** — once you have a location, update Come Find Us and the cart footer in one edit.
5. **Test with a real florist** — send one trusted florist the application link and walk them through the portal.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Stripe sandbox not claimed → test payments fail | High if not done | Blocks all checkout testing | Claim it first, before anything else |
| No real farm photos → gallery looks empty | Certain | Low — placeholders are in place | Upload through admin panel when available |
| Pickup hub not announced → customer confusion | Medium | Low — messaging is clear about TBD | Update one line in ComeFindUs when ready |
| Florist applies but no GHL workflow → no auto-reply | High | Medium — looks unprofessional | Build GHL Workflow 1 in first week |

---

## What You Should NOT Do Before 10 AM

- Do not add new features
- Do not redesign any page
- Do not change the photo assignments again
- Do not build GHL workflows (do it after launch)
- Do not add dried flower products back
- Do not change prices

The site is ready. The only job between now and 10 AM is to test the checkout and click Publish.
