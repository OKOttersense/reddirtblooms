/**
 * GHL Webhook Router
 * Handles incoming webhooks from GoHighLevel for florist applications
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { handleFloristApplicationWebhook } from "../webhooks/ghlFloristWebhook";

export const ghlWebhookRouter = router({
  /**
   * Receive florist application webhook from GHL
   * Called when a contact is created with the florist-under-review tag
   */
  floristApplication: publicProcedure
    .input(
      z.object({
        type: z.string(),
        contact: z
          .object({
            id: z.string(),
            firstName: z.string().optional(),
            lastName: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            customFields: z.record(z.string(), z.any()).optional(),
            tags: z.array(z.string()).optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await handleFloristApplicationWebhook(input);
        return { success: true, message: "Florist application webhook processed" };
      } catch (error) {
        console.error("[GHL Webhook] Error:", error);
        return { success: false, message: "Failed to process webhook" };
      }
    }),
});
