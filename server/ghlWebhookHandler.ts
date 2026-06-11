/**
 * GHL Webhook Handler for Florist Applications
 * Receives raw POST requests from GoHighLevel
 */

import { Request, Response } from "express";
import { handleFloristApplicationWebhook } from "./webhooks/ghlFloristWebhook";

export async function ghlWebhookHandler(req: Request, res: Response) {
  try {
    const payload = req.body;

    console.log("[GHL Webhook] Received payload:", JSON.stringify(payload, null, 2));

    // Handle the webhook
    await handleFloristApplicationWebhook(payload);

    // Return success response
    res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("[GHL Webhook] Error processing webhook:", error);
    res.status(500).json({ success: false, error: "Failed to process webhook" });
  }
}
