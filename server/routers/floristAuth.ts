/**
 * Florist Auth Router
 * Separate email/password authentication for wholesale florist portal.
 * Florists register via /florist-register, admin approves, then they can log in.
 */

import { z } from "zod";
import bcrypt from "bcryptjs";
import * as jose from "jose";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { floristAccounts, passwordResetTokens } from "../../drizzle/schema";
import { notifyOwner } from "../_core/notification";
import { syncFloristToGHL, updateFloristStatusInGHL } from "../ghl";
import { ENV } from "../_core/env";

const FLORIST_COOKIE = "florist_session";
const FLORIST_JWT_EXPIRY = "7d";

// ── helpers ──────────────────────────────────────────────────────────────────

async function signFloristJwt(floristId: number, email: string): Promise<string> {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  return new jose.SignJWT({ sub: floristId.toString(), email, type: "florist" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(FLORIST_JWT_EXPIRY)
    .sign(secret);
}

async function verifyFloristJwt(token: string): Promise<{ id: number; email: string } | null> {
  try {
  const secret = new TextEncoder().encode(ENV.cookieSecret);
  const { payload } = await jose.jwtVerify(token, secret);
    if (payload.type !== "florist" || !payload.sub) return null;
    return { id: parseInt(payload.sub, 10), email: payload.email as string };
  } catch {
    return null;
  }
}

export async function getFloristFromRequest(req: any): Promise<typeof floristAccounts.$inferSelect | null> {
  const raw = req.cookies?.[FLORIST_COOKIE];
  if (!raw) return null;
  const payload = await verifyFloristJwt(raw);
  if (!payload) return null;
  const db = await getDb();
  if (!db) return null;
  const [florist] = await db.select().from(floristAccounts).where(eq(floristAccounts.id, payload.id)).limit(1);
  return florist ?? null;
}

// ── router ────────────────────────────────────────────────────────────────────

export const floristAuthRouter = router({
  /** Register a new florist account (pending approval) */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
        businessName: z.string().min(2),
        contactName: z.string().min(2),
        phone: z.string().optional(),
        city: z.string().optional(),
        website: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Get database
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });

      // Allow duplicate emails for testing — each submission creates a new pending account
      // In production, you'd want to enforce unique emails or merge duplicate applications

      const passwordHash = await bcrypt.hash(input.password, 12);

      await db.insert(floristAccounts).values({
        email: input.email.toLowerCase(),
        passwordHash,
        businessName: input.businessName,
        contactName: input.contactName,
        phone: input.phone || null,
        city: input.city || null,
        website: input.website || null,
        status: "pending",
      });



      // Notify owner
      await notifyOwner({
        title: "New Florist Portal Application",
        content: `${input.businessName} (${input.contactName}) applied for wholesale portal access.\nEmail: ${input.email}\nCity: ${input.city ?? "not provided"}\nWebsite: ${input.website ?? "not provided"}\n\nReview at /admin/harvest`,
      });

      return { success: true, message: "Application submitted! We'll review and email you within 1–2 business days." };
    }),

  /** Login with email + password */
  login: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });

      const [florist] = await db
        .select()
        .from(floristAccounts)
        .where(eq(floristAccounts.email, input.email.toLowerCase()))
        .limit(1);

      if (!florist) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
      }

      const valid = await bcrypt.compare(input.password, florist.passwordHash);
      if (!valid) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
      }

      if (florist.status === "pending") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your application is pending approval. We'll email you when you're approved.",
        });
      }

      if (florist.status === "declined") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Your application was not approved. Contact us for more information.",
        });
      }

      const token = await signFloristJwt(florist.id, florist.email);

      ctx.res.cookie(FLORIST_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });

      return {
        success: true,
        florist: {
          id: florist.id,
          email: florist.email,
          businessName: florist.businessName,
          contactName: florist.contactName,
          status: florist.status,
        },
      };
    }),

  /** Get current florist from session cookie */
  me: publicProcedure.query(async ({ ctx }) => {
    const raw = (ctx.req as any).cookies?.[FLORIST_COOKIE];
    if (!raw) return null;
    const payload = await verifyFloristJwt(raw);
    if (!payload) return null;
    const db = await getDb();
    if (!db) return null;
    const [florist] = await db
      .select({
        id: floristAccounts.id,
        email: floristAccounts.email,
        businessName: floristAccounts.businessName,
        contactName: floristAccounts.contactName,
        status: floristAccounts.status,
        city: floristAccounts.city,
        phone: floristAccounts.phone,
        website: floristAccounts.website,
        createdAt: floristAccounts.createdAt,
      })
      .from(floristAccounts)
      .where(eq(floristAccounts.id, payload.id))
      .limit(1);
    return florist ?? null;
  }),

  /** Logout — clear session cookie */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    ctx.res.clearCookie(FLORIST_COOKIE, { path: "/" });
    return { success: true };
  }),

  // ── Admin procedures ──────────────────────────────────────────────────────

  /** List all florist applications (admin only) */
  listApplications: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required." });
    }
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });
    return db
      .select({
        id: floristAccounts.id,
        email: floristAccounts.email,
        businessName: floristAccounts.businessName,
        contactName: floristAccounts.contactName,
        phone: floristAccounts.phone,
        city: floristAccounts.city,
        website: floristAccounts.website,
        status: floristAccounts.status,
        createdAt: floristAccounts.createdAt,
      })
      .from(floristAccounts)
      .orderBy(desc(floristAccounts.createdAt));
  }),

  /** Approve a florist application (admin only) */
  approveFlorist: protectedProcedure
    .input(z.object({ floristId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });
      const [approvedFlorist] = await db
        .select()
        .from(floristAccounts)
        .where(eq(floristAccounts.id, input.floristId))
        .limit(1);
      await db
        .update(floristAccounts)
        .set({ status: "approved" })
        .where(eq(floristAccounts.id, input.floristId));

      // Fire-and-forget GHL sync — creates/updates contact with florist-approved tag
      // Does NOT block the approval response; GHL failure is logged but ignored
      if (approvedFlorist) {
        syncFloristToGHL({
          email: approvedFlorist.email,
          contactName: approvedFlorist.contactName,
          businessName: approvedFlorist.businessName,
          phone: approvedFlorist.phone,
          city: approvedFlorist.city,
          website: approvedFlorist.website,
          status: "approved",
        }).catch((e) => console.error("[GHL] approve sync failed (non-blocking):", e));
      }

      return { success: true };
    }),

  /** Request a password reset — generates a token and emails it to the owner for relay */
  requestPasswordReset: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });

      // Always return success to prevent email enumeration
      const [florist] = await db
        .select({ id: floristAccounts.id, email: floristAccounts.email, contactName: floristAccounts.contactName })
        .from(floristAccounts)
        .where(eq(floristAccounts.email, input.email.toLowerCase()))
        .limit(1);

      if (florist) {
        // Invalidate any existing tokens for this florist
        await db.delete(passwordResetTokens).where(eq(passwordResetTokens.floristId, florist.id));

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await db.insert(passwordResetTokens).values({
          floristId: florist.id,
          token,
          expiresAt,
        });

        // Notify owner to relay reset link to florist
        // In production, replace with direct email to florist via SendGrid/Resend
        const resetUrl = `https://www.reddirtblooms.ai/florist-reset-password?token=${token}`;
        await notifyOwner({
          title: `Password Reset Request — ${florist.email}`,
          content: `${florist.contactName} (${florist.email}) requested a password reset.\n\nSend them this link (expires in 1 hour):\n${resetUrl}`,
        });
      }

      return { success: true, message: "If an account exists with that email, a reset link has been sent." };
    }),

  /** Reset password using a valid token */
  resetPassword: publicProcedure
    .input(z.object({
      token: z.string().min(1),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });

      const [resetToken] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, input.token),
            gt(passwordResetTokens.expiresAt, new Date())
          )
        )
        .limit(1);

      if (!resetToken || resetToken.usedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This reset link is invalid or has expired. Please request a new one.",
        });
      }

      const passwordHash = await bcrypt.hash(input.newPassword, 12);

      // Update password and mark token as used in parallel
      await Promise.all([
        db.update(floristAccounts).set({ passwordHash }).where(eq(floristAccounts.id, resetToken.floristId)),
        db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, resetToken.id)),
      ]);

      return { success: true, message: "Password updated successfully. You can now log in." };
    }),

  /** Update florist profile (authenticated florists only) */
  updateProfile: publicProcedure
    .input(z.object({
      contactName: z.string().min(2).optional(),
      phone: z.string().optional(),
      website: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const raw = (ctx.req as any).cookies?.[FLORIST_COOKIE];
      if (!raw) throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated." });
      const payload = await verifyFloristJwt(raw);
      if (!payload) throw new TRPCError({ code: "UNAUTHORIZED", message: "Session expired." });

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });

      const updates: Record<string, unknown> = {};
      if (input.contactName !== undefined) updates.contactName = input.contactName;
      if (input.phone !== undefined) updates.phone = input.phone;
      if (input.website !== undefined) updates.website = input.website;

      if (Object.keys(updates).length > 0) {
        await db.update(floristAccounts).set(updates).where(eq(floristAccounts.id, payload.id));
      }

      return { success: true };
    }),

  /** Reject a florist application (admin only) */
  rejectFlorist: protectedProcedure
    .input(z.object({ floristId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable." });
      const [rejectedFlorist] = await db
        .select()
        .from(floristAccounts)
        .where(eq(floristAccounts.id, input.floristId))
        .limit(1);
      await db
        .update(floristAccounts)
        .set({ status: "declined" })
        .where(eq(floristAccounts.id, input.floristId));

      // Fire-and-forget GHL sync — tags contact as florist-declined
      if (rejectedFlorist) {
        updateFloristStatusInGHL(rejectedFlorist.email, "declined")
          .catch((e) => console.error("[GHL] reject sync failed (non-blocking):", e));
      }

      return { success: true };
    }),
});
