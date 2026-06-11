/**
 * Gallery Router — admin CRUD for gallery_photos, public read endpoint.
 * Photo uploads handled by /api/gallery/upload-photo (see server/_core/index.ts).
 */
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { galleryPhotos } from "../../drizzle/schema";

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db;
}

function adminOnly(role: string) {
  if (role !== "admin") throw new Error("Admin only");
}

export const galleryRouter = router({
  /** Public: get all published gallery photos ordered by sortOrder */
  getPublished: publicProcedure.query(async () => {
    const db = await requireDb();
    return db
      .select()
      .from(galleryPhotos)
      .where(eq(galleryPhotos.isPublished, true))
      .orderBy(galleryPhotos.sortOrder, desc(galleryPhotos.createdAt));
  }),

  /** Admin: get all gallery photos (published + unpublished) */
  getAll: protectedProcedure.query(async ({ ctx }) => {
    adminOnly(ctx.user.role);
    const db = await requireDb();
    return db
      .select()
      .from(galleryPhotos)
      .orderBy(galleryPhotos.sortOrder, desc(galleryPhotos.createdAt));
  }),

  /** Admin: create a new gallery photo entry (no image yet) */
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(256),
        caption: z.string().optional(),
        category: z.string().default("The Farm"),
        variety: z.string().optional(),
        varietyLatin: z.string().optional(),
        varietyVaseLife: z.string().optional(),
        varietyStemLength: z.string().optional(),
        varietySeason: z.string().optional(),
        varietyDesignUse: z.string().optional(),
        varietyTags: z.string().optional(),
        varietyColor: z.string().optional(),
        sortOrder: z.number().default(0),
        isPublished: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();
      const [result] = await db.insert(galleryPhotos).values({
        title: input.title,
        caption: input.caption ?? null,
        category: input.category,
        variety: input.variety ?? null,
        varietyLatin: input.varietyLatin ?? null,
        varietyVaseLife: input.varietyVaseLife ?? null,
        varietyStemLength: input.varietyStemLength ?? null,
        varietySeason: input.varietySeason ?? null,
        varietyDesignUse: input.varietyDesignUse ?? null,
        varietyTags: input.varietyTags ?? null,
        varietyColor: input.varietyColor ?? null,
        sortOrder: input.sortOrder,
        isPublished: input.isPublished,
      });
      return { success: true, id: (result as any).insertId as number };
    }),

  /** Admin: update gallery photo metadata */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1).max(256).optional(),
        caption: z.string().optional(),
        category: z.string().optional(),
        variety: z.string().optional(),
        varietyLatin: z.string().optional(),
        varietyVaseLife: z.string().optional(),
        varietyStemLength: z.string().optional(),
        varietySeason: z.string().optional(),
        varietyDesignUse: z.string().optional(),
        varietyTags: z.string().optional(),
        varietyColor: z.string().optional(),
        sortOrder: z.number().optional(),
        isPublished: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();
      const { id, ...rest } = input;
      const updates: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(rest)) {
        if (v !== undefined) updates[k] = v;
      }
      await db.update(galleryPhotos).set(updates).where(eq(galleryPhotos.id, id));
      return { success: true };
    }),

  /** Admin: toggle publish/unpublish */
  setPublished: protectedProcedure
    .input(z.object({ id: z.number(), published: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();
      await db
        .update(galleryPhotos)
        .set({ isPublished: input.published })
        .where(eq(galleryPhotos.id, input.id));
      return { success: true };
    }),

  /** Admin: delete a gallery photo */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();
      await db.delete(galleryPhotos).where(eq(galleryPhotos.id, input.id));
      return { success: true };
    }),

  /** Admin: update sort order for multiple photos at once */
  reorder: protectedProcedure
    .input(z.array(z.object({ id: z.number(), sortOrder: z.number() })))
    .mutation(async ({ input, ctx }) => {
      adminOnly(ctx.user.role);
      const db = await requireDb();
      for (const item of input) {
        await db
          .update(galleryPhotos)
          .set({ sortOrder: item.sortOrder })
          .where(eq(galleryPhotos.id, item.id));
      }
      return { success: true };
    }),
});
