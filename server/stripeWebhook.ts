/**
 * Red Dirt Blooms — Stripe Webhook Handler
 * Registered BEFORE express.json() in server/_core/index.ts
 */
import type { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "./db";
import { orders } from "../drizzle/schema";
import { notifyOwner } from "./_core/notification";
import { createGHLContactFromStripeCheckout, handleStripePaymentFailed } from "./webhooks/stripeGhlWebhook";

// Lazy-init: don't crash at import time if STRIPE_SECRET_KEY is missing
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set — cannot process payments.");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

export async function stripeWebhookHandler(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    return res.status(400).send("Missing stripe-signature header");
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    console.error("[Webhook] Signature verification failed:", err);
    return res.status(400).send("Webhook signature verification failed");
  }

  // REQUIRED: handle Stripe test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    // Stripe populates customer_details.name when the buyer enters their name at checkout.
    // metadata.customer_name is only present when the server explicitly sets it (e.g. florist portal).
    // Always prefer customer_details.name — it is the most reliable source.
    const resolvedCustomerName =
      (session as unknown as { customer_details?: { name?: string | null } }).customer_details?.name ||
      session.metadata?.customer_name ||
      null;

    try {
      const db = await getDb();
      if (db) {
        await db.insert(orders).values({
          stripeSessionId: session.id,
          stripePaymentIntentId: session.payment_intent as string || null,
          customerEmail: session.customer_email || session.metadata?.customer_email || null,
          customerName: resolvedCustomerName,
          productName: session.metadata?.product_name || null,
          productType: (session.metadata?.product_type as "bouquet" | "subscription" | "dried" | "seeds") || "bouquet",
          amountCents: session.amount_total || null,
          status: "paid",
          userId: session.metadata?.user_id ? parseInt(session.metadata.user_id) : null,
        }).onDuplicateKeyUpdate({ set: { status: "paid" } });
      }

      // Push to GoHighLevel CRM (create contact + trigger workflow)
      try {
        await createGHLContactFromStripeCheckout(session);
      } catch (ghlErr) {
        console.error("[Webhook] GHL contact creation failed (non-fatal):", ghlErr);
      }

      // Notify the farm owner
      await notifyOwner({
        title: "💐 New Order Received!",
        content: `${session.customer_email || "A customer"} just ordered ${session.metadata?.product_name || "a product"} for $${((session.amount_total || 0) / 100).toFixed(2)}.`,
      });
    } catch (err) {
      console.error("[Webhook] Failed to save order:", err);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    try {
      await handleStripePaymentFailed(paymentIntent.receipt_email || "");
    } catch (ghlErr) {
      console.error("[Webhook] GHL payment-failed sync failed (non-fatal):", ghlErr);
    }
  }

  return res.json({ received: true });
}
