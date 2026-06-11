# Red Dirt Blooms — Project TODO

## Core Pages
- [x] Home page with hero, trust bar, Instagram strip, bloom preview, shop preview, testimonials, Bloom Watch
- [x] The Bloom Diary page (video/photo diary with tag filtering)
- [x] What's in the Ground page (growing varieties with bloom stage progress)
- [x] The Harvest Stand (shop with Fresh, Subscriptions, Dried, Seeds tabs + cart drawer)
- [x] Roots & Story (about page)
- [x] Come Find Us (contact + FAQ)
- [x] Florist Portal (wholesale page)
- [x] Order Success page (post-Stripe checkout confirmation)

## Design & Brand
- [x] Prairie Modern design system (Red Dirt Rust, Prairie Sage, Blanket Flower Gold)
- [x] Cormorant Garamond headings, DM Sans body, Caveat accent fonts
- [x] Navbar with all routes
- [x] Footer with social links and florist portal link
- [x] Responsive layout across all pages

## Features
- [x] Dusty AI chatbot (LLM-powered, quick-reply chips, minimize button, unread badge)
- [x] How It Works process section on homepage (4-step "From Red Dirt to Your Door")
- [x] Bloom Watch email capture forms wired to backend (hero + homepage section)
- [x] Bloom Watch backend subscriber storage in database
- [x] Stripe checkout wired on Harvest Stand (Buy Now + Reserve My Spot buttons)
- [x] Stripe webhook handler for order confirmation
- [x] Cart drawer with quantity controls

## Backend
- [x] Database schema (users, bloom_subscribers, orders)
- [x] bloomWatch.subscribe tRPC procedure
- [x] checkout.createSession tRPC procedure
- [x] dusty.chat tRPC procedure (LLM-powered)
- [x] Stripe webhook endpoint at /api/stripe/webhook
- [x] Stripe products catalog (8 products)

## Tests
- [x] auth.logout.test.ts (1 test)
- [x] bloomWatch.test.ts (3 tests)

## Pending / Future
- [x] Wire "Wake Me When It Blooms" buttons on What's in the Ground to email capture
- [x] Admin dashboard to view bloom subscribers
- [ ] Email delivery integration (Mailchimp / ConvertKit / GHL)
- [x] Florist portal application form backend
- [x] Blog/video upload admin panel for Bloom Diary
- [ ] Instagram API live feed integration

## Round 3 — All Remaining Items
- [x] Wire "Wake Me When It Blooms" buttons on What's in the Ground to email capture modal
- [x] Admin dashboard: bloom subscriber list with count and export
- [x] Admin dashboard: florist application review panel
- [x] Admin dashboard: Bloom Diary post management (add/edit/delete posts)
- [x] Wire florist portal application form to backend with database storage and owner notification
- [x] Bloom Diary admin panel for uploading videos and blog posts
- [x] Add /admin and /diary-admin routes to App.tsx

## Round 4 — Prairie Chic Feature Section
- [x] Generate Prairie Chic editorial imagery (3 images)
- [x] Build Prairie Chic feature section component
- [x] Integrate Prairie Chic section into homepage

## Round 5 — CSA Subscription Landing Page
- [x] CSA pricing analysis and competitor research (5 Oklahoma farms)
- [x] Oklahoma growing season research (frost dates, harvest windows)
- [x] Premium pricing model: 3 tiers ($135 / $320 / $560)
- [x] Build standalone CSA landing page at /csa (fully isolated)
- [x] Wire CSA Stripe checkout (bloom-box-4week, bloom-box-8week, harvest-bouquet)
- [x] Delivery add-on (+$12/delivery) and Dried Flower add-on (+$45)
- [x] Isolate CSA page from main site nav/footer/chatbot
- [x] Add Bloom Watch email capture to CSA page
- [x] Add Oklahoma harvest calendar section
- [x] Add 8-question FAQ accordion
- [x] Scarcity badge (spots remaining)
- [x] Pickup locations and delivery zone grid

## Round 6 — Process, Gallery & CSA Section
- [ ] Generate 12 farm photo gallery images (field, harvest, bouquets, behind-the-scenes)
- [ ] Build photo gallery page at /gallery with masonry/grid layout and lightbox
- [ ] Add gallery link to main navigation
- [ ] Enhance How It Works process section with richer visuals and animations
- [ ] Add new "Meet the Grower" or "From the Field" section to CSA landing page
- [ ] Wire gallery into App.tsx routes

## Round 7 — Skill + CSA Section
- [ ] Read skill-creator skill and understand skill structure
- [ ] Create How It Works process skill (reusable Manus skill)
- [ ] Add new section to CSA landing page

## Round 8 — Why Organic Section + Competitor Comparison Page
- [x] Inject CSAWhyOrganicSection into CSALanding.tsx (after harvest calendar, before tier selector)
- [x] Build /why-us competitor comparison page (Prairie Modern design, premium value positioning)
- [x] Add Why Us link to main navbar

## Round 9 — Why Us FAQ Section
- [x] Add FAQ section to /why-us page (premium pricing + locally grown value questions)

## Round 10 — Bloom Box Popup
- [x] Remove Spring Bloom Box from available products / Stripe price references
- [x] Build BloomBoxPopup component (site-wide, first-visit, barely-visible X and No thanks, prominent buy CTA)
- [x] Wire BloomBoxPopup into App.tsx so it shows on every page on first visit

## Round 11 — Harvest Window Recalculation
- [x] Recalculate bouquet counts based on first harvest ~June 12 through first frost ~Oct 21 (OKC avg)
- [x] Update CSALanding tier data (weeks, bouquets, prices, descriptions) to match real harvest window
- [x] Update HarvestStand subscription product descriptions and BloomBoxPopup tier cards
- [x] Update Dusty system prompt with corrected subscription info

## Round 12 — Two-Tier Subscription Simplification
- [x] Simplify CSALanding to two tiers: Weekly Bloom Share (18 bouquets, $595) and Bi-Weekly Bloom Share (9 bouquets, $315), both June 12–Oct 15
- [x] Update HarvestStand SUBSCRIPTION_PRODUCTS to match two-tier structure
- [x] Update stripeProducts.ts with two correct SKUs (weekly-bloom-share, biweekly-bloom-share)
- [x] Update BloomBoxPopup tier cards to show the two new options
- [x] Update Dusty system prompt with simplified subscription info

## Round 13 — Bouquet Count Correction
- [x] Update Weekly Bloom Share to 12 bouquets and Bi-Weekly to 6 bouquets across all touchpoints

## Round 14 — Bouquet Bar Popup Link
- [x] Add subtle Bouquet Bar text link below "No thanks" in BloomBoxPopup (gold accent, small text, links to /bouquet-bar)
- [x] Build /bouquet-bar event inquiry page (birthday, anniversary, engagement, baby shower) with form wired to owner notifications
- [x] Register /bouquet-bar route in App.tsx with standalone layout (no global nav/footer/chatbot)

## Round 15 — Popup Bouquet Bar Text Update
- [x] Update popup Bouquet Bar line to: "Planning something special? Ask about our Bouquet Bar!" with "Bouquet Bar" hyperlinked to /bouquet-bar

## Round 16 — Subscription Window & Mother Nature Language
- [x] Update CSALanding tiers to June–October window with Mother Nature caveat and guaranteed total bouquet count
- [x] Update HarvestStand subscription descriptions with same language
- [x] Update BloomBoxPopup tier cards with updated window language
- [x] Update Dusty system prompt with new subscription terms

## Round 17 — Bouquet Bar Redesign + Gift Sub + Demo Enhancement
- [x] Redesign /bouquet-bar with full Prairie Modern layout (hero, event type cards, gallery strip, inquiry form)
- [x] Add gift subscription toggle + recipient fields to CSA checkout (CSALanding)
- [x] Build demo enhancement — animated "Sample Week" bouquet reveal section on CSA or Home page

## Round 17 — Gap Fixes
- [x] Wire gift data (isGift, giftRecipient, giftMessage) through checkout.createSession to Stripe metadata
- [x] Update SampleWeekDemo copy to clearly label content as illustrative preview, not real member photos

## Round 18 — Stripe→GHL Webhook Handler & Email Templates
- [ ] Build server/ghlWebhook.ts — Stripe checkout.session.completed → GHL contact creation with all tags and custom fields
- [ ] Handle payment_intent.payment_failed → apply payment-failed tag in GHL
- [ ] Wire ghlWebhook.ts into server/_core/index.ts
- [x] Add GHL_API_KEY and GHL_LOCATION_ID secrets
- [ ] Generate all 16 GHL email templates as ready-to-paste document

## Round 19 — Bouquet Bar Full Redesign
- [x] Redesign /bouquet-bar with full Prairie Modern layout, event type cards, gallery, inquiry form, and "Planning something special? Ask about our Bouquet Bar!" CTA text wired as hyperlink

## Round 20 — Bouquet Bar Date Picker
- [x] Replace native date input in Bouquet Bar inquiry form with interactive calendar popover (shadcn Calendar + Popover)

## Round 21 — Bouquet Bar Form Validation
- [x] Add inline validation for name, email, and event date fields in Bouquet Bar inquiry form (required, email format check, error messages on submit attempt)

## Round 22 — Bouquet Bar Form Enhancements
- [x] Add visually appealing success screen after form submission (animated flowers, confirmation details, next steps)
- [x] Replace event type chip buttons with a styled dropdown select menu
- [x] Add loading spinner to submit button while notify.isPending

## Round 23 — Florist Portal: Dashboard, File Upload, Password Reset, Skill

### Password Reset Flow
- [x] Add password_reset_tokens table to drizzle schema and push migration
- [x] Build floristAuth.requestPasswordReset procedure (generate token, send email via notifyOwner)
- [x] Build floristAuth.resetPassword procedure (validate token, hash new password, invalidate token)
- [x] Build /florist-forgot-password page (email input form)
- [x] Build /florist-reset-password page (token from URL, new password form)
- [x] Wire new routes into App.tsx

### Secure Florist Dashboard
- [x] Build /florist-dashboard page (profile card, order history, account settings)
- [x] Add floristPortal.myOrders tRPC procedure
- [x] Add floristAuth.updateProfile tRPC procedure (name, phone, website)
- [x] Redirect unauthenticated florists from /florist-portal and /florist-dashboard to /florist-login
- [x] Wire /florist-dashboard route into App.tsx

### Admin File Upload for Harvest Photos
- [x] Add photo_url column to harvest_listings table and push migration
- [x] Build server-side upload endpoint (multipart → S3 via storagePut, POST /api/harvest/upload-photo)
- [x] Add photo upload UI to admin harvest management panel (Harvest Board tab)
- [x] Display uploaded photos on florist portal harvest board

### Florist Portal Manus Skill
- [x] Initialize skill with init_skill.py
- [x] Write SKILL.md covering architecture, auth flow, GHL sync, file upload, password reset
- [x] Add reference doc for DB schema and tRPC procedure map
- [x] Validate and deliver skill

## Round 25 — GHL Form Embed Integration
- [x] Replace custom florist registration form with GHL iframe embed (Form ID: O2aIfPoyWVrjKTElVJW5)
- [x] Fix FloristRegister.tsx JSX syntax errors (missing closing tags, orphaned password fields)
- [x] Integrate GHL form script (form_embed.js) into page
- [x] Remove dead form state and custom validation logic (form, errors, submitted, registerMutation, validate, handleSubmit)
- [x] Customize GHL form colors to match Prairie Modern design (dark bg, rust accents, cream text)
- [x] Verify GHL workflow trigger is set to Contact Created (no tag filter)
- [x] Verify first workflow action adds florist-applicant tag
- [x] Build GHL webhook handler (ghlFloristWebhook.ts) to sync contacts to local DB
- [x] Create tRPC endpoint for webhook (ghlWebhook.ts router)
- [x] Add webhook tests (4 test cases)
- [ ] Configure webhook URL in GHL settings — PENDING USER SETUP
- [ ] Test end-to-end: Submit form to GHL, webhook fires, application appears in admin portal — PENDING USER TESTING

## Round 24 — SendGrid, Suggestion Box, Order from Dashboard, Filtering, Process Skill

### Process/Workflow Manus Skill
- [ ] Initialize reddirtblooms-process skill with init_skill.py
- [ ] Write SKILL.md covering florist onboarding workflow, harvest publish workflow, order fulfillment workflow, and password reset relay workflow
- [ ] Validate and deliver skill

### SendGrid Integration
- [ ] Add SENDGRID_API_KEY secret
- [ ] Create server/email.ts helper (sendEmail, sendPasswordReset, sendApprovalNotice, sendHarvestBlast)
- [ ] Wire sendPasswordReset into floristAuth.requestPasswordReset (replace notifyOwner relay)
- [ ] Wire sendApprovalNotice into floristAuth.approve (email florist their login link)
- [ ] Wire sendHarvestBlast into harvest.publishAndNotify (direct email to all approved florists)
- [ ] Add vitest for email helper (mock SendGrid API)

### Florist Suggestion Box
- [ ] Add florist_suggestions table to drizzle schema and push migration
- [ ] Build floristSuggestions.submit tRPC procedure (florist submits suggestion)
- [ ] Build floristSuggestions.getAll tRPC procedure (admin view all suggestions)
- [ ] Build floristSuggestions.markReviewed tRPC procedure (admin marks reviewed)
- [ ] Add Suggestion Box UI to FloristDashboard (tab or section with form)
- [ ] Add Suggestions tab to AdminDashboard with filter by status and category
- [ ] Notify owner on new suggestion via notifyOwner

### Order from Dashboard
- [ ] Add "Browse & Order" button/tab to FloristDashboard linking to FloristPortal
- [ ] Add quick-order widget to FloristDashboard showing current published listings
- [ ] Add order confirmation modal with summary before submitting
- [ ] Show order status badges on FloristDashboard order history (with cancel option for pending)

### Filtering & Sorting on Harvest Board
- [ ] Add filter bar to FloristPortal harvest board (by variety/keyword, price range, availability)
- [ ] Add sort controls (price low-high, price high-low, newest, most available)
- [ ] Add filter/sort to AdminDashboard Harvest Board tab (by status: all/draft/live)
- [ ] Persist filter state in URL query params on FloristPortal

## Round 25 — Florist Self-Signup + Portfolio Lookbook

### Portfolio Schema & Backend
- [x] Add portfolio_items table (id, title, variety, season, description, imageUrl, imageKey, sortOrder, createdAt)
- [x] Push migration with pnpm db:push
- [x] Add portfolio.getAll tRPC procedure (public — no auth required)
- [x] Add portfolio.create tRPC procedure (admin only)
- [x] Add portfolio.update tRPC procedure (admin only)
- [x] Add portfolio.delete tRPC procedure (admin only)
- [x] Add POST /api/portfolio/upload-photo REST endpoint (multipart, admin JWT, storagePut)
- [x] Add Portfolio tab to AdminDashboard with photo upload, variety label, drag-to-reorder

### Florist Portfolio/Lookbook Page
- [x] Build /florist-portfolio page (public, no login required — accessible from QR code or link)
- [x] Grid layout: masonry or 3-col grid, each card shows photo + variety + season
- [x] Filter bar: by variety keyword, by season (spring/summer/fall/all)
- [x] Full-screen lightbox on photo click
- [x] CTA banner at top: "Interested in wholesale? Create your account" → /florist-register
- [x] CTA banner at bottom: "Already have an account? Log in" → /florist-login

### Florist Register & Login Polish
- [x] Add "View our portfolio" link on FloristRegister page
- [x] Add "View our portfolio" link on FloristLogin page
- [x] Ensure /florist-register is fully self-service (no invite code needed)
- [x] After register success, show message: "We'll review your application and email you within 24 hours"
- [x] After login success, redirect approved florists to /florist-portal (harvest board)
- [ ] After login, pending florists see a friendly "Application under review" screen

## Round 26 — Skill, Favorites, Admin Portfolio
- [x] Create portfolio-lookbook Manus skill documenting the full system
- [x] Add portfolio_favorites table to drizzle schema and push migration
- [x] Add portfolio.toggleFavorite and portfolio.getMyFavorites tRPC procedures
- [x] Add heart/favorite button to FloristPortfolio page (florist-auth session aware, sonner toast feedback)
- [x] Enhance admin portfolio tab: inline edit form, sort order controls, photo preview, delete confirmation
- [x] Add photo upload support to admin portfolio tab (hover-to-upload on each card)

## Round 27 — Social Media, Skill, Script, Florist Registration Page
- [x] Research local flower farm social media best practices and content hooks
- [x] Generate 5 social media designs: 3 Instagram feed posts (1:1), 1 story (9:16), 1 reel cover (9:16)
- [x] Create social-media-strategy Manus skill
- [x] Write florist outreach video/reel script (60-90 second format)
- [x] Rebuild /florist-register as full conversion-optimized landing page (hero, stats, benefits, how-it-works, QR code, form)
- [x] Wire /florist-register route in App.tsx (already existed)

## Round 28 — Real-Time Features, Seasonal Calendar Embed, Skill
- [x] Build SSE (Server-Sent Events) endpoint for live harvest board updates
- [x] Wire SSE into FloristPortal harvest board (auto-refresh on new listings)
- [x] Wire SSE into FloristDashboard order history (live order status updates)
- [x] Build /seasonal-calendar page on main site with embedded interactive calendar
- [x] Add Seasonal Calendar link to main navigation
- [x] Create real-time-features Manus skill documenting SSE architecture and patterns

## Round 29 — 11-Item Fix Pass
- [ ] What's in the Ground: sort all varieties alphabetically
- [ ] What's in the Ground: expand Gomphrena Audray series into individual color cards (White, Pink, Purple-Red)
- [ ] What's in the Ground: separate Marigold into 3 individual cards (Red Metamorphosis, Orange Lei, Sparkler)
- [ ] What's in the Ground: separate Gomphrena Purple as its own card (not grouped with Audray)
- [ ] Navbar: condense nav links (shorten labels, reduce count visible at once)
- [ ] Navbar: remove "Shop the Harvest" CTA button from navbar
- [ ] Navbar: change login icon to something less generic
- [ ] Navbar: add Bouquet Bar link so users can navigate there without the popup
- [ ] Come Find Us: rewrite for private property micro farm — no visitors, emphasize temporary location
- [ ] Remove dried flower bouquet products (defer to Season 2)
- [ ] Expand FAQ section with more questions
- [ ] Fix florist application flow — application not coming through

## Round 30 — Filtering, Gallery, Skill, Location Removal

- [x] Remove farm address/location from ComeFindUs info cards (Farm Location card)
- [x] Remove pickup hours card from ComeFindUs
- [x] Remove "Pickup available" text from HarvestStand cart footer
- [x] Remove any pickup hours or farm address references from Home page
- [x] Remove pickup hours from Navbar or any other pages that reference farm location
- [x] Add filter bar to HarvestStand: filter by product type, price range, availability toggle
- [x] Add filter/sort bar to WhatsInTheGround: filter by category, growth stage, search by name
- [x] Build visual Gallery page (/gallery) with photo grid, category filter tabs, lightbox modal, and variety tagging
- [x] Add interactive variety selection on Gallery — clicking a variety card shows details panel
- [x] Register /gallery route in App.tsx (already exists as nav link)
- [x] Create reddirtblooms skill at /home/ubuntu/skills/reddirtblooms/SKILL.md
- [x] Validate reddirtblooms skill with quick_validate.py

## Harvest Stand Rebuild — Farm-Direct Bunch Model
- [x] Update DB schema: add pricingTier, price2Stem, price4Stem, price6Stem, focalPrice to harvest_listings
- [x] Update orders.productType enum to include 'bunch'
- [x] Run pnpm db:push to migrate schema
- [x] Create new Stripe products/prices: Premium 2/4/6 ($5/$9/$12), Specialty 2/4/6 ($9/$15/$21), 2 subscriptions
- [x] Update stripeProducts.ts to new bunch-based catalog with getBunchPrice() helper
- [x] Update checkout router to accept dynamic variety/stemSize/pricingTier metadata
- [x] Rebuild HarvestStand.tsx: variety cards with 2/4/6 stem buy buttons, no cart needed
- [x] Update Admin Dashboard harvest publisher to support tier selector + price override
- [x] Update harvest.ts router create/update to handle new fields
- [x] Add stripeProducts.test.ts (6 tests — all passing)

## Round 28 — Flower Farm Gallery (Bold, Vibrant Editorial Showcase)
- [x] Standardize all 16 flower images (1200x1200px, +15% brightness, +25% contrast, +20% saturation)
- [x] Upload standardized images to Manus storage with metadata catalog
- [x] Build BloomDiaryGallery component (featured + horizontal scroll with favorites/share)
- [x] Build WhatsInTheGroundGallery component (growth tracking with progress bars)
- [x] Build MasterGallery component (grid/list view with filtering by variety/type)
- [x] Integrate gallery routes into App.tsx (/bloom-diary-gallery, /whats-in-ground-gallery, /master-gallery)
- [x] Add gallery navigation links to navbar (Bloom Gallery, Ground Gallery, Master Gallery)
- [x] All tests passing (13 tests, 0 errors)
- [x] TypeScript validation complete (no errors)
- [x] Create checkpoint and deliver


## Round 29 — Automated Stripe Product Sync System
- [x] Add color field to harvest_listings schema
- [x] Add Stripe sync tracking columns (stripeProductId*, stripePriceId*, syncedToStripe, lastSyncedAt)
- [x] Run db:push to migrate schema (8 new columns)
- [x] Create server/stripeSync.ts with naming logic (Plant-Color-StemSize-Tier Bunch)
- [x] Implement syncHarvestListingToStripe() for single listings
- [x] Implement bulkSyncToStripe() for batch operations
- [x] Create server/routers/stripeSync.ts with 3 admin procedures (syncListing, bulkSync, getStatus)
- [x] Wire stripeSync router into main routers.ts
- [x] Add color field to harvest create/update input schemas
- [x] Add Stripe sync mutations to AdminDashboard (syncListingToStripe, bulkSyncToStripe)
- [x] Add sync button UI to harvest listings in AdminDashboard (single + bulk)
- [x] Add Stripe sync status modal/display with summary counts
- [x] Generate Excel workbook (Stripe-Product-Catalog.xlsx) with 4 sheets
- [x] Create comprehensive testing plan (STRIPE-SYNC-TEST-PLAN.md) with 8 phases
- [x] Create Manus skill (reddirtblooms-stripe-sync/SKILL.md)
- [ ] Run full test suite (Phase 1-8)
- [ ] Create checkpoint

## Round 29 Final — Stripe Sync Testing & Documentation Complete
- [x] Run Phase 1 unit tests (30/30 passing) — pricing tiers, naming, consistency
- [x] Run Phase 2-4 integration tests (36/36 passing) — admin UI, bulk sync, status display
- [x] Create comprehensive Phase 2-4 integration test suite (stripeSync.integration.test.ts)
- [x] Generate complete Excel documentation (Stripe-Sync-Complete-Documentation.xlsx, 8 sheets)
- [x] Create admin UI feature documentation (ADMIN-UI-FEATURES.md, 20 systems, 79 tests)
- [x] Total test coverage: 79 tests passing across all suites
- [x] Create final checkpoint with all deliverables

**PROJECT STATUS: ✅ COMPLETE**
- Harvest Stand: Farm-direct bunch model with tier-based pricing
- Admin Dashboard: Full Stripe sync system with single + bulk operations
- Database: 8 new columns for sync tracking and pricing
- Testing: 79 tests passing (unit, integration, error handling, API)
- Documentation: Excel workbook + Markdown guides + Manus skill
- Ready for: Manual testing Phase 5-8 (Stripe dashboard, checkout flow, webhook)

## Round 31 — Harvest Stand Product Gallery Expansion
- [x] Upload 4 new flower images to Manus storage (St. John's Wort, Bee Balm Pink, Gomphrena Red, Verbena Purple)
- [x] Add 4 new varieties to LAUNCH_VARIETIES array in HarvestStand.tsx
- [x] Assign correct storage URLs to each new variety with Specialty tier pricing
- [x] Verify TypeScript compilation (0 errors)
- [x] Run test suite (79 tests passing)
- [x] Create checkpoint

## Round 32 — Navbar Restructuring
- [x] Top-level nav: Bloom Diary, In the Ground, Harvest Stand, Bouquet Bar, Bloom Gallery
- [x] Create About Us dropdown: Our Story, Calendar, The Contestants, Find Us
- [x] Rename "Ground Gallery" to "The Contestants"
- [x] Move "The Contestants" under About Us after Calendar
- [x] Remove "Gallery" link from top level
- [x] Add dropdown functionality for desktop and mobile
- [x] Verify TypeScript compilation (0 errors)
- [x] Run test suite (79 tests passing)
- [x] Create checkpoint

## Round 33 — Lamb's Ear Product Image
- [x] Upload high-quality Lamb's Ear image to Manus storage
- [x] Update LAUNCH_VARIETIES array with photoUrl for Lamb's Ear
- [x] Verify TypeScript compilation (0 errors)
- [x] Run test suite (79 tests passing)
- [x] Create checkpoint

## Round 34 — GHL API Pull-Based Approach (Speed > Reliability > Simplicity)
- [x] Create GHL API helper function to query pending florist applications (contacts with florist-applicant tag)
- [x] Add tRPC procedure `florist.getPendingApplications` that calls GHL API directly (getFloristApps now queries GHL API)
- [x] Update AdminDashboard to call new tRPC procedure instead of querying local DB
- [ ] Remove webhook endpoint `/api/ghl/webhook/florist-app` from Express routes
- [ ] Remove ghlFloristWebhook.ts file (keep for now, may be useful for future workflows)
- [ ] Drop floristApplications table from database (optional — keep for fallback)
- [ ] Test end-to-end: submit GHL form → verify appears in admin portal within seconds
- [ ] Document GHL API approach in project README

## Round 35 — GHL Email Templates, Skill, Florist Features, Content Fixes, GHL Cleanup

### GHL Email Templates & Workflow Guide
- [x] Generate 16 GHL email templates (florist onboarding, harvest blast, order confirmation, etc.)
- [x] Write step-by-step GHL workflow guide (10 automations)
- [x] Save to references/GHL-Email-Templates-and-Workflow-Guide.md

### Manus Skill (rdb-operations)
- [x] Create rdb-operations skill covering florist onboarding, harvest publish, order fulfillment, password reset relay
- [x] Save to /home/ubuntu/skills/rdb-operations/SKILL.md

### Florist Features
- [x] Add florist_suggestions table to drizzle schema and push migration
- [x] Build floristPortal.submitSuggestion tRPC procedure
- [x] Build admin.getSuggestions and admin.updateSuggestionStatus tRPC procedures
- [x] Add Suggestion Box tab to FloristDashboard
- [x] Add Suggestions tab to AdminDashboard with status controls
- [x] Pending florist screen on login (already implemented — verified working)

### Content Fixes
- [x] Expand FAQ from 11 to 16 questions (seeds at ~120/variety, Bloom Watch, CSA, private property detail)
- [x] Rewrite Come Find Us private property notice (more detailed)
- [x] No dried flowers tab existed — nothing to remove
- [x] Varieties already alphabetically sorted — no change needed
- [x] Gomphrena/Marigold already individual cards — no change needed

### Navbar Updates
- [x] Condense nav labels: Bloom Diary → Diary, Bloom Gallery → Gallery
- [x] Change login icon from KeyRound to User
- [x] Bouquet Bar already in top-level nav — no change needed
- [x] No Shop the Harvest CTA button existed — nothing to remove

### GHL Cleanup
- [x] Remove old GHL webhook endpoint /api/ghl/webhook/florist-app from Express server
- [x] Remove ghlWebhookHandler import from server/_core/index.ts
- [x] Remove ghlWebhookRouter import and registration from server/routers.ts
- [x] Document GHL API approach in references/GHL-API-Approach.md
- [x] All 83 tests passing after cleanup

### Round 34 Carryover (completed this round)
- [x] Remove webhook endpoint /api/ghl/webhook/florist-app from Express routes
- [x] Remove ghlWebhookRouter from routers.ts
- [x] Document GHL API approach in project references
