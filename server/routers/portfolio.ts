import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { portfolioItems, portfolioFavorites } from "../../drizzle/schema";
import { eq, asc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getFloristFromRequest } from "./floristAuth";

export const portfolioRouter = router({
  /**
   * Public — no auth required. Returns all portfolio items sorted by sortOrder.
   */
  getAll: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    const items = await db
      .select()
      .from(portfolioItems)
      .orderBy(asc(portfolioItems.sortOrder), asc(portfolioItems.createdAt));
    return items;
  }),

  /**
   * Admin — create a new portfolio item.
   */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(256),
        variety: z.string().min(1).max(256),
        season: z.enum(["spring", "summer", "fall", "winter", "year-round"]),
        description: z.string().max(2000).optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const [item] = await db
        .insert(portfolioItems)
        .values({
          title: input.title,
          variety: input.variety,
          season: input.season,
          description: input.description ?? null,
          imageUrl: input.imageUrl ?? null,
          imageKey: input.imageKey ?? null,
          sortOrder: input.sortOrder,
        })
        .$returningId();
      return { id: item.id };
    }),

  /**
   * Admin — update an existing portfolio item (patch any fields).
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        title: z.string().min(1).max(256).optional(),
        variety: z.string().min(1).max(256).optional(),
        season: z.enum(["spring", "summer", "fall", "winter", "year-round"]).optional(),
        description: z.string().max(2000).nullable().optional(),
        imageUrl: z.string().nullable().optional(),
        imageKey: z.string().nullable().optional(),
        sortOrder: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      const { id, ...fields } = input;
      const updateData: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(fields)) {
        if (v !== undefined) updateData[k] = v;
      }
      await db.update(portfolioItems).set(updateData).where(eq(portfolioItems.id, id));
      return { success: true };
    }),

  /**
   * Admin — delete a portfolio item.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin only" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      await db.delete(portfolioItems).where(eq(portfolioItems.id, input.id));
      return { success: true };
    }),

  /**
   * Florist — toggle a portfolio item as favorite.
   * Requires florist_session cookie. Returns { favorited: boolean }.
   */
  toggleFavorite: publicProcedure
    .input(z.object({ portfolioItemId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const florist = await getFloristFromRequest(ctx.req);
      if (!florist) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Florist login required" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [existing] = await db
        .select()
        .from(portfolioFavorites)
        .where(
          and(
            eq(portfolioFavorites.floristAccountId, florist.id),
            eq(portfolioFavorites.portfolioItemId, input.portfolioItemId)
          )
        )
        .limit(1);

      if (existing) {
        await db.delete(portfolioFavorites).where(eq(portfolioFavorites.id, existing.id));
        return { favorited: false };
      } else {
        await db.insert(portfolioFavorites).values({
          floristAccountId: florist.id,
          portfolioItemId: input.portfolioItemId,
        });
        return { favorited: true };
      }
    }),

  /**
   * Florist — get all favorited portfolio item IDs for the current florist.
   * Returns empty array if not logged in (graceful degradation).
   */
  getMyFavorites: publicProcedure.query(async ({ ctx }) => {
    const florist = await getFloristFromRequest(ctx.req);
    if (!florist) return [];
    const db = await getDb();
    if (!db) return [];
    const rows = await db
      .select({ portfolioItemId: portfolioFavorites.portfolioItemId })
      .from(portfolioFavorites)
      .where(eq(portfolioFavorites.floristAccountId, florist.id));
    return rows.map((r) => r.portfolioItemId);
  }),
});
