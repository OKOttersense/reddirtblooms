# Stripe → GHL Webhook Setup Guide
## Step-by-Step Instructions for Payment Confirmation Workflow

---

## Overview

**What happens:**
1. Customer completes Stripe checkout
2. Stripe fires `checkout.session.completed` webhook
3. Our server receives webhook → creates GHL contact
4. GHL contact gets tags + metadata + custom fields
5. GHL workflow triggers → sends confirmation email to customer

**Result:** Customer gets automated confirmation email within seconds of payment.

---

## Part 1: Verify Stripe Webhook Endpoint (Already Done)

Your webhook endpoint is already configured:
- **Endpoint URL:** `https://reddirtblooms-okaw6f2t.manus.space/api/stripe/webhook`
- **Events:** `checkout.session.completed`, `payment_intent.payment_failed`
- **Status:** Active ✓

**To verify in Stripe Dashboard:**
1. Go to https://dashboard.stripe.com/webhooks
2. Find endpoint: `https://reddirtblooms-okaw6f2t.manus.space/api/stripe/webhook`
3. Click it → should show "Enabled" and recent events

---

## Part 2: Create GHL Workflow (In GHL Dashboard)

### Step 1: Create New Workflow in GHL

1. **Log into GHL:** https://app.gohighlevel.com
2. **Navigate:** Automations → Workflows
3. **Click:** "Create New Workflow"
4. **Name:** `Payment Confirmation Email`
5. **Description:** "Sends confirmation email when customer completes Stripe purchase"

### Step 2: Set Trigger

1. **Click:** "Add Trigger"
2. **Select:** "Contact Tag Added"
3. **Choose Tag:** `stripe-paid` (we'll create this tag via webhook)
4. **Click:** "Save Trigger"

### Step 3: Add Email Action

1. **Click:** "Add Action"
2. **Select:** "Send Email"
3. **Configure Email:**
   - **From:** Your business email (e.g., orders@reddirtblooms.ai)
   - **Subject:** `Your Red Dirt Blooms Order Confirmation`
   - **Body:** (See template below)
   - **Click:** "Save"

### Step 4: Email Template

Use this template (customize as needed):

```
Hi {{firstName}},

Thank you for your order! 🌸

**Order Details:**
- Order ID: {{customField_orderId}}
- Amount: {{customField_amount}}
- Date: {{customField_orderDate}}
- Items: {{customField_items}}

**What's Next:**
1. We'll prepare your flowers with care
2. You'll receive a shipping notification within 1-2 business days
3. Delivery/pickup details: {{customField_deliveryInfo}}

**Questions?**
Reply to this email or visit: https://www.reddirtblooms.ai/contact

Can't wait to get these beauties to you!

— The Red Dirt Blooms Team
```

### Step 5: Publish Workflow

1. **Click:** "Publish" (top right)
2. **Confirm:** "Yes, publish this workflow"
3. **Status:** Should show "Active" ✓

---

## Part 3: Create GHL Tags (In GHL Dashboard)

### Create Tags for Payment States

1. **Navigate:** Contacts → Tags
2. **Click:** "Create New Tag"
3. **Create these 3 tags:**

| Tag Name | Color | Description |
|----------|-------|-------------|
| `stripe-paid` | Green | Customer completed payment |
| `stripe-pending` | Yellow | Payment processing |
| `stripe-failed` | Red | Payment failed |

**Steps for each tag:**
1. Enter tag name
2. Choose color
3. Add description
4. Click "Create"

---

## Part 4: Create GHL Custom Fields (In GHL Dashboard)

### Add Fields to Store Order Data

1. **Navigate:** Settings → Custom Fields
2. **Click:** "Add Custom Field"
3. **Create these 5 fields:**

| Field Name | Type | Description |
|------------|------|-------------|
| `orderId` | Text | Stripe order/session ID |
| `amount` | Text | Total payment amount |
| `orderDate` | Date | When order was placed |
| `items` | Text | Product names + quantities |
| `deliveryInfo` | Text | Pickup/delivery instructions |

**Steps for each field:**
1. Enter field name (use exact names above)
2. Select type (Text or Date)
3. Add description
4. Click "Create"

---

## Part 5: Build Webhook Handler (In Your Code)

### Step 1: Create GHL Webhook Handler File

Create file: `server/webhooks/stripeGhlWebhook.ts`

```typescript
import { stripe } from "@/server/_core/sdk";
import { invokeLLM } from "@/server/_core/llm";

const GHL_API_KEY = process.env.GHL_API_KEY;
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID;

interface StripeCheckoutSession {
  id: string;
  customer_email: string;
  client_reference_id?: string;
  metadata?: {
    user_id?: string;
    customer_name?: string;
    customer_email?: string;
    items?: string;
    amount?: string;
  };
  payment_intent?: string;
  total_details?: {
    amount_total?: number;
  };
}

/**
 * Create GHL contact from Stripe checkout session
 */
export async function createGHLContactFromStripeCheckout(
  session: StripeCheckoutSession
) {
  if (!GHL_API_KEY || !GHL_LOCATION_ID) {
    console.error("[GHL] Missing API key or location ID");
    return null;
  }

  try {
    const email = session.customer_email || session.metadata?.customer_email;
    const name = session.metadata?.customer_name || "Customer";
    const orderId = session.id;
    const amount = (session.total_details?.amount_total || 0) / 100; // Convert cents to dollars
    const items = session.metadata?.items || "Flowers";
    const orderDate = new Date().toISOString().split("T")[0];

    // Step 1: Check if contact already exists
    const existingContact = await getGHLContactByEmail(email);
    let contactId: string;

    if (existingContact) {
      contactId = existingContact.id;
      console.log(`[GHL] Found existing contact: ${contactId}`);
    } else {
      // Step 2: Create new contact
      const createResponse = await fetch(
        `https://rest.gohighlevel.com/v1/contacts/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GHL_API_KEY}`,
            "Content-Type": "application/json",
            Version: "2021-04-15",
          },
          body: JSON.stringify({
            locationId: GHL_LOCATION_ID,
            firstName: name.split(" ")[0],
            lastName: name.split(" ").slice(1).join(" ") || "Customer",
            email: email,
            source: "Stripe Checkout",
          }),
        }
      );

      if (!createResponse.ok) {
        const error = await createResponse.json();
        console.error("[GHL] Failed to create contact:", error);
        return null;
      }

      const createData = await createResponse.json();
      contactId = createData.contact?.id;
      console.log(`[GHL] Created new contact: ${contactId}`);
    }

    // Step 3: Add custom fields
    await updateGHLContactFields(contactId, {
      orderId,
      amount: `$${amount.toFixed(2)}`,
      orderDate,
      items,
      deliveryInfo: "Check your email for delivery details",
    });

    // Step 4: Add "stripe-paid" tag (triggers workflow)
    await addGHLTag(contactId, "stripe-paid");

    console.log(`[GHL] Contact ${contactId} updated with payment info`);
    return contactId;
  } catch (error) {
    console.error("[GHL] Webhook handler error:", error);
    return null;
  }
}

/**
 * Get GHL contact by email
 */
async function getGHLContactByEmail(email: string) {
  try {
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/search?email=${encodeURIComponent(email)}&locationId=${GHL_LOCATION_ID}`,
      {
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          Version: "2021-04-15",
        },
      }
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data.contacts?.[0] || null;
  } catch (error) {
    console.error("[GHL] Search error:", error);
    return null;
  }
}

/**
 * Update GHL contact custom fields
 */
async function updateGHLContactFields(
  contactId: string,
  fields: Record<string, string>
) {
  try {
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/${contactId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          "Content-Type": "application/json",
          Version: "2021-04-15",
        },
        body: JSON.stringify({
          locationId: GHL_LOCATION_ID,
          customFields: fields,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("[GHL] Failed to update fields:", error);
    }
  } catch (error) {
    console.error("[GHL] Update error:", error);
  }
}

/**
 * Add tag to GHL contact (triggers workflow)
 */
async function addGHLTag(contactId: string, tagName: string) {
  try {
    const response = await fetch(
      `https://rest.gohighlevel.com/v1/contacts/${contactId}/tags`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          "Content-Type": "application/json",
          Version: "2021-04-15",
        },
        body: JSON.stringify({
          locationId: GHL_LOCATION_ID,
          tags: [tagName],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error(`[GHL] Failed to add tag ${tagName}:`, error);
    }
  } catch (error) {
    console.error("[GHL] Tag error:", error);
  }
}

/**
 * Handle payment failure
 */
export async function handleStripePaymentFailed(email: string) {
  try {
    const contact = await getGHLContactByEmail(email);
    if (!contact) return;

    await addGHLTag(contact.id, "stripe-failed");
    console.log(`[GHL] Added stripe-failed tag to ${contact.id}`);
  } catch (error) {
    console.error("[GHL] Payment failed handler error:", error);
  }
}
```

### Step 2: Update Stripe Webhook Handler

Update file: `server/_core/index.ts` (or wherever your webhook handler is)

Find the Stripe webhook handler and update it:

```typescript
import { createGHLContactFromStripeCheckout, handleStripePaymentFailed } from "@/server/webhooks/stripeGhlWebhook";

// In your webhook handler:
app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected");
    return res.json({ verified: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as StripeCheckoutSession;
      
      // NEW: Create GHL contact
      await createGHLContactFromStripeCheckout(session);
      
      // Existing: Save order to DB
      // ... your existing order save logic ...
    }

    if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object;
      
      // NEW: Handle payment failure
      await handleStripePaymentFailed(paymentIntent.receipt_email);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing event:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});
```

---

## Part 6: Test the Webhook (Step-by-Step)

### Test 1: Verify Webhook Receives Events

1. **Open Stripe Dashboard:** https://dashboard.stripe.com/webhooks
2. **Find endpoint:** `https://reddirtblooms-okaw6f2t.manus.space/api/stripe/webhook`
3. **Click:** "Send test event"
4. **Select:** `checkout.session.completed`
5. **Click:** "Send event"
6. **Check server logs:** Should see `[Webhook] Test event detected`

### Test 2: Simulate Payment

1. **Go to:** `/csa` or `/harvest-stand` (checkout page)
2. **Add item to cart**
3. **Click:** "Checkout"
4. **Use test card:** `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
5. **Click:** "Pay"
6. **Wait:** 2-3 seconds

### Test 3: Verify GHL Contact Created

1. **Log into GHL:** https://app.gohighlevel.com
2. **Navigate:** Contacts
3. **Search:** For the test email you used
4. **Verify:**
   - ✓ Contact exists
   - ✓ Has `stripe-paid` tag (green)
   - ✓ Custom fields populated (orderId, amount, orderDate, items)

### Test 4: Verify Email Workflow Triggered

1. **In GHL:** Automations → Workflows
2. **Click:** "Payment Confirmation Email" workflow
3. **Check:** "Recent Executions" tab
4. **Verify:**
   - ✓ Workflow ran (shows execution)
   - ✓ Email sent (check test email inbox)

### Test 5: Check Email Content

1. **Open test email inbox**
2. **Look for:** Email from your business email
3. **Subject:** "Your Red Dirt Blooms Order Confirmation"
4. **Verify:**
   - ✓ Order ID appears
   - ✓ Amount appears
   - ✓ Items listed
   - ✓ Delivery info included

---

## Part 7: Troubleshooting

### Issue: Webhook not receiving events

**Check:**
1. Is endpoint URL correct? (Should match exactly)
2. Is webhook "Enabled" in Stripe dashboard?
3. Check server logs for errors
4. Try sending test event manually

**Fix:**
```bash
# Check server logs
cd /home/ubuntu/reddirtblooms
tail -100 .manus-logs/devserver.log | grep -i webhook
```

### Issue: GHL contact not created

**Check:**
1. Is `GHL_API_KEY` set? (Check Settings → Secrets)
2. Is `GHL_LOCATION_ID` set?
3. Check server logs for GHL API errors

**Fix:**
```bash
# Verify env vars
grep -i "GHL_" /home/ubuntu/reddirtblooms/.env
```

### Issue: Email not sent

**Check:**
1. Is workflow "Active"? (Check Automations → Workflows)
2. Does contact have `stripe-paid` tag?
3. Did workflow execute? (Check "Recent Executions")
4. Check GHL logs for email errors

**Fix:**
1. Re-publish workflow
2. Manually add `stripe-paid` tag to test contact
3. Check GHL email settings (From address, etc.)

### Issue: Custom fields not populated

**Check:**
1. Do custom fields exist in GHL? (Settings → Custom Fields)
2. Are field names spelled exactly right?
3. Check server logs for update errors

**Fix:**
1. Create missing custom fields
2. Verify field names match code exactly
3. Check GHL API response for errors

---

## Part 8: Go Live Checklist

Before switching to live Stripe keys:

- [ ] Test webhook with test card (4242 4242 4242 4242)
- [ ] Verify GHL contact created with tags
- [ ] Verify email workflow triggered
- [ ] Verify email received in test inbox
- [ ] Check GHL dashboard shows all custom fields populated
- [ ] Verify workflow is "Active" in GHL
- [ ] Test on published domain (not just dev server)

Once all tests pass:

1. **Get live Stripe keys:**
   - Go to https://dashboard.stripe.com/account/apikeys
   - Switch from "Test" to "Live"
   - Copy live keys

2. **Update secrets in Manus:**
   - Go to Management UI → Settings → Secrets
   - Update `STRIPE_SECRET_KEY` (live key)
   - Update `VITE_STRIPE_PUBLISHABLE_KEY` (live key)
   - Update `STRIPE_WEBHOOK_SECRET` (live secret)

3. **Publish:**
   - Create checkpoint
   - Click "Publish"
   - Wait 2-5 minutes for deployment

4. **Verify live:**
   - Go to www.reddirtblooms.ai
   - Place test order with real card (or use promo code for $0.01)
   - Verify GHL contact created
   - Verify email sent

---

## Summary

**What you've built:**
- Stripe webhook → GHL contact creation
- Automatic tagging (stripe-paid)
- Custom field population (order details)
- Email workflow trigger (confirmation email)
- Payment failure handling

**Result:** Customers get automated confirmation emails within seconds of payment. ✓

**Next steps:** Follow Part 6 (testing) to verify everything works, then Part 8 (go live) to switch to live keys.

