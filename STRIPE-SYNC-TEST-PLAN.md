# Stripe Product Sync — Comprehensive Test Plan

**Project:** Red Dirt Blooms  
**Feature:** Automated Stripe Product Sync System  
**Naming Convention:** `{Variety}-{Color}-{StemSize}Stem-{Tier} Bunch`  
**Pricing Model:** Premium ($5/$9/$12), Specialty ($9/$15/$21), Focal (market price)

---

## Test Objectives

1. **Product Creation:** Verify Stripe products are created with correct naming and pricing
2. **Sync Status Tracking:** Confirm database tracks sync state accurately
3. **Admin UI:** Validate sync buttons and status displays work as expected
4. **Bulk Operations:** Test single and batch sync operations
5. **Error Handling:** Verify graceful failures and recovery
6. **End-to-End:** Confirm florist checkout uses synced product IDs

---

## Phase 1: Unit Tests (Server-Side)

### Test 1.1: Naming Convention Generation
**Objective:** Verify product names are generated correctly  
**Test Data:**
- Variety: "Gaura", Color: "Pink", Tier: "premium", StemSize: "2"
- Expected: `Gaura-Pink-2Stem-Premium Bunch`

**Steps:**
1. Call `generateProductName(variety, color, stemSize, tier)`
2. Assert output matches expected format
3. Repeat for all tier combinations

**Pass Criteria:** All naming combinations correct

---

### Test 1.2: Price Lookup by Tier
**Objective:** Verify pricing tiers return correct prices  
**Test Data:**
- Premium 2-stem: $5.00
- Specialty 4-stem: $15.00
- Focal: $0.01 (placeholder)

**Steps:**
1. Call `getBunchPrice(tier, stemSize)`
2. Assert price matches tier definition
3. Test all 9 combinations (3 tiers × 3 sizes)

**Pass Criteria:** All prices correct

---

### Test 1.3: Stripe API Integration
**Objective:** Verify Stripe API calls are formatted correctly  
**Test Data:**
- Product name, description, pricing
- Metadata (variety, color, tier)

**Steps:**
1. Mock Stripe API
2. Call `syncHarvestListingToStripe(listing)`
3. Assert API called with correct parameters
4. Verify response handling

**Pass Criteria:** API calls formatted correctly, responses handled

---

## Phase 2: Integration Tests (Admin Dashboard)

### Test 2.1: Single Listing Sync
**Objective:** Sync one listing to Stripe via admin UI  
**Test Data:**
- Create listing: Gaura, Pink, Premium, 20 qty
- Sync via "Sync to Stripe" button

**Steps:**
1. Log in as admin
2. Go to Admin Dashboard → Harvest tab
3. Create new listing with all required fields
4. Click "Sync to Stripe" button
5. Verify button shows loading state
6. Wait for completion
7. Verify status badge shows "✓ Synced"

**Pass Criteria:**
- Button disabled during sync
- Status updates to "Synced"
- No error toasts
- Database updated with Stripe IDs

---

### Test 2.2: Bulk Sync Operation
**Objective:** Sync multiple unsynced listings at once  
**Test Data:**
- 3 unsynced listings (Gaura, Yarrow, Dahlia)

**Steps:**
1. Create 3 listings without syncing
2. Click "Sync 3 to Stripe" button in toolbar
3. Verify modal shows summary (total, synced, unsynced)
4. Click "Sync Now"
5. Monitor progress
6. Verify all 3 listings show "✓ Synced"

**Pass Criteria:**
- All listings synced
- Status modal accurate
- No partial failures

---

### Test 2.3: Sync Status Display
**Objective:** Verify sync status is displayed correctly  
**Test Data:**
- Mix of synced and unsynced listings

**Steps:**
1. Create 5 listings
2. Sync 2 of them
3. Refresh admin dashboard
4. Verify synced listings show "✓ Synced" badge
5. Verify unsynced listings show "Sync to Stripe" button
6. Verify toolbar shows "Sync 3 to Stripe"

**Pass Criteria:**
- Status badges accurate
- Button counts correct
- Status persists after refresh

---

### Test 2.4: Color Field Requirement
**Objective:** Verify color field is required for sync  
**Test Data:**
- Listing without color

**Steps:**
1. Try to create listing without color
2. Verify validation error appears
3. Fill color field
4. Verify form submits

**Pass Criteria:** Color field enforced

---

## Phase 3: Stripe Dashboard Verification

### Test 3.1: Product Creation in Stripe
**Objective:** Verify products appear in Stripe dashboard  
**Steps:**
1. Log into Stripe dashboard
2. Go to Products
3. Search for synced product names
4. Verify 3 products exist per listing (2/4/6 stem)
5. Verify pricing is correct
6. Verify metadata includes variety, color, tier

**Pass Criteria:**
- All products visible in Stripe
- Naming matches convention
- Pricing correct
- Metadata complete

---

### Test 3.2: Price IDs Correct
**Objective:** Verify price IDs are valid for checkout  
**Steps:**
1. In Stripe dashboard, click product
2. Copy price IDs for each size
3. Compare to database `stripePriceId2Stem/4Stem/6Stem`
4. Verify they match

**Pass Criteria:** Price IDs match Stripe

---

### Test 3.3: Metadata Validation
**Objective:** Verify metadata is useful for tracking  
**Steps:**
1. In Stripe dashboard, view product details
2. Check metadata section
3. Verify contains: variety, color, tier, stemSize
4. Verify values are correct

**Pass Criteria:** Metadata complete and accurate

---

## Phase 4: Checkout Flow Testing

### Test 4.1: Florist Checkout with Synced Product
**Objective:** Verify florist can checkout using synced product  
**Test Data:**
- Synced Gaura listing (Premium 2-stem, $5)

**Steps:**
1. Go to Harvest Stand (public)
2. Select Gaura variety
3. Click "2-stem" button
4. Verify checkout opens in Stripe
5. Verify amount is $5
6. Use test card 4242 4242 4242 4242
7. Complete checkout
8. Verify success page

**Pass Criteria:**
- Checkout opens
- Amount correct
- Payment succeeds
- Order created in database

---

### Test 4.2: Multiple Sizes Checkout
**Objective:** Verify different stem sizes use correct prices  
**Test Data:**
- Specialty Dahlia (4-stem, $15)

**Steps:**
1. Select Dahlia
2. Click "4-stem" button
3. Verify checkout shows $15
4. Complete payment
5. Verify order amount is $15

**Pass Criteria:** Correct price for each size

---

### Test 4.3: Focal Pricing Override
**Objective:** Verify focal flowers use market price  
**Test Data:**
- Focal flower, market price $14.00

**Steps:**
1. Create focal listing with $14.00 price
2. Sync to Stripe
3. Go to Harvest Stand
4. Select focal flower
5. Verify price shows $14.00
6. Checkout and verify amount

**Pass Criteria:** Market price used correctly

---

## Phase 5: Error Handling & Edge Cases

### Test 5.1: Sync Retry on Failure
**Objective:** Verify failed sync can be retried  
**Steps:**
1. Simulate Stripe API failure (mock)
2. Try to sync listing
3. Verify error toast appears
4. Fix mock (restore API)
5. Click "Sync to Stripe" again
6. Verify sync succeeds

**Pass Criteria:** Retry works, no duplicate products

---

### Test 5.2: Duplicate Sync Prevention
**Objective:** Verify syncing already-synced listing doesn't create duplicates  
**Steps:**
1. Sync listing (verify Stripe IDs saved)
2. Click "Sync to Stripe" again
3. Monitor Stripe dashboard
4. Verify no duplicate products created
5. Verify existing product updated

**Pass Criteria:** No duplicates, idempotent

---

### Test 5.3: Missing Required Fields
**Objective:** Verify sync fails gracefully if fields missing  
**Test Data:**
- Listing with missing color

**Steps:**
1. Manually create listing without color (bypass UI)
2. Try to sync via API
3. Verify error returned
4. Verify no Stripe product created

**Pass Criteria:** Validation enforced, error clear

---

### Test 5.4: Stripe Rate Limiting
**Objective:** Verify bulk sync handles rate limits  
**Steps:**
1. Sync 10+ listings rapidly
2. Monitor for rate limit errors
3. Verify retry logic kicks in
4. Verify all eventually sync

**Pass Criteria:** Graceful rate limit handling

---

## Phase 6: Data Integrity

### Test 6.1: Database Sync State Tracking
**Objective:** Verify database accurately reflects sync status  
**Steps:**
1. Create listing
2. Verify `syncedToStripe = false` in DB
3. Sync to Stripe
4. Query database
5. Verify `syncedToStripe = true`
6. Verify `stripeProductId2Stem/4Stem/6Stem` populated
7. Verify `stripePriceId2Stem/4Stem/6Stem` populated
8. Verify `lastSyncedAt` timestamp set

**Pass Criteria:** All fields updated correctly

---

### Test 6.2: Timestamp Accuracy
**Objective:** Verify sync timestamps are accurate  
**Steps:**
1. Note current time
2. Sync listing
3. Check `lastSyncedAt` in database
4. Verify timestamp within 5 seconds of current time

**Pass Criteria:** Timestamp accurate

---

### Test 6.3: Concurrent Syncs
**Objective:** Verify multiple simultaneous syncs don't cause conflicts  
**Steps:**
1. Create 3 listings
2. Trigger sync on all 3 simultaneously (via API)
3. Monitor database
4. Verify all sync without conflicts
5. Verify Stripe has all 3 products

**Pass Criteria:** No race conditions, all synced

---

## Phase 7: User Experience

### Test 7.1: Loading States
**Objective:** Verify UI shows loading feedback  
**Steps:**
1. Click "Sync to Stripe"
2. Verify button shows spinner
3. Verify button disabled
4. Verify no duplicate clicks possible
5. Wait for completion
6. Verify spinner stops

**Pass Criteria:** Clear loading feedback

---

### Test 7.2: Success Notifications
**Objective:** Verify user gets success feedback  
**Steps:**
1. Sync listing
2. Verify success toast appears
3. Verify toast message is clear
4. Verify status badge updates

**Pass Criteria:** Clear success feedback

---

### Test 7.3: Error Messages
**Objective:** Verify error messages are helpful  
**Steps:**
1. Trigger error (mock Stripe failure)
2. Verify error toast appears
3. Verify message explains what went wrong
4. Verify "Retry" option available

**Pass Criteria:** Error messages actionable

---

## Phase 8: Performance

### Test 8.1: Sync Speed (Single)
**Objective:** Verify single sync completes in reasonable time  
**Steps:**
1. Time single listing sync
2. Verify completes in < 5 seconds

**Pass Criteria:** < 5 seconds

---

### Test 8.2: Bulk Sync Speed
**Objective:** Verify bulk sync scales reasonably  
**Steps:**
1. Time bulk sync of 10 listings
2. Verify completes in < 30 seconds

**Pass Criteria:** < 30 seconds for 10 listings

---

### Test 8.3: Database Query Performance
**Objective:** Verify sync status queries are fast  
**Steps:**
1. Time `getStatus()` query with 100+ listings
2. Verify completes in < 1 second

**Pass Criteria:** < 1 second

---

## Test Execution Schedule

| Phase | Timeline | Owner |
|-------|----------|-------|
| Phase 1 (Unit) | Day 1 | Dev |
| Phase 2 (Integration) | Day 1-2 | QA |
| Phase 3 (Stripe Dashboard) | Day 2 | QA |
| Phase 4 (Checkout) | Day 2-3 | QA |
| Phase 5 (Error Handling) | Day 3 | Dev/QA |
| Phase 6 (Data Integrity) | Day 3 | Dev |
| Phase 7 (UX) | Day 4 | QA |
| Phase 8 (Performance) | Day 4 | Dev |

---

## Acceptance Criteria

✅ All unit tests pass  
✅ All integration tests pass  
✅ All products visible in Stripe dashboard  
✅ Florist checkout works end-to-end  
✅ No duplicate products created  
✅ Sync status accurate in database  
✅ Error handling graceful  
✅ Performance acceptable  
✅ User feedback clear  
✅ Excel workbook updated with Stripe IDs  

---

## Rollback Plan

If critical issues found:
1. Disable sync button in admin UI
2. Revert to manual Stripe product creation
3. Investigate root cause
4. Fix and re-test
5. Re-enable sync button

---

## Sign-Off

- [ ] Dev Lead: ___________  Date: _____
- [ ] QA Lead: ___________  Date: _____
- [ ] Product Owner: ___________  Date: _____
