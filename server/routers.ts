import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import Stripe from "stripe";
import { getDb } from "./db";
import { bloomSubscribers, orders, floristApplications, diaryPosts, floristSuggestions } from "../drizzle/schema";
import { eq, desc, count } from "drizzle-orm";
import { getProductById, getProducts } from "./stripeProducts";
import { notifyOwner } from "./_core/notification";
import { invokeLLM } from "./_core/llm";
import { floristAuthRouter } from "./routers/floristAuth";
import { harvestRouter } from "./routers/harvest";
import { floristPortalRouter } from "./routers/floristPortal";
import { portfolioRouter } from "./routers/portfolio";
import { galleryRouter } from "./routers/gallery";
import { stripeSyncRouter } from "./routers/stripeSync";
import { syncFloristToGHL, syncContactToGHL } from "./ghl";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export const appRouter = router({
  system: systemRouter,
  floristAuth: floristAuthRouter,
  harvest: harvestRouter,
  floristPortal: floristPortalRouter,
  portfolio: portfolioRouter,
  gallery: galleryRouter,
  stripeSync: stripeSyncRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  products: router({
    list: publicProcedure.query(() => getProducts()),
  }),

  bloomWatch: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        try {
          await db.insert(bloomSubscribers).values({
            email: input.email,
            name: input.name || null,
            source: input.source || "homepage",
            active: true,
          });
          await notifyOwner({
            title: "🌸 New Bloom Watch Subscriber!",
            content: `${input.email}${input.name ? ` (${input.name})` : ""} just signed up for Bloom Watch from ${input.source || "homepage"}.`,
          });
          // Fire-and-forget GHL sync — tag as bloom-watch
          syncContactToGHL({
            email: input.email,
            name: input.name || null,
            tags: ["bloom-watch"],
            source: "Bloom Watch Signup",
          }).catch((err) => console.error("[GHL] bloomWatch.subscribe sync error:", err));
          return { success: true, message: "You're on the Bloom Watch! We'll holler when the next harvest is ready. 🌸" };
        } catch (err: unknown) {
          // Check both the error itself and its cause for ER_DUP_ENTRY
          const isDupEntry = (e: unknown): boolean => {
            if (!e || typeof e !== "object") return false;
            const obj = e as Record<string, unknown>;
            if (obj.code === "ER_DUP_ENTRY") return true;
            if (obj.cause) return isDupEntry(obj.cause);
            return false;
          };
          if (isDupEntry(err)) {
            return { success: true, message: "You're already on the Bloom Watch! We'll see you at harvest time. 🌸" };
          }
          throw err;
        }
      }),

    count: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { count: 0 };
      const result = await db.select().from(bloomSubscribers).where(eq(bloomSubscribers.active, true));
      return { count: result.length };
    }),
  }),

  checkout: router({
    // Legacy single-product checkout (kept for subscriptions)
    createSession: publicProcedure
      .input(z.object({
        productId: z.string(),
        origin: z.string().url(),
        customerEmail: z.string().email().optional(),
        variety: z.string().optional(),
        stemSize: z.number().optional(),
        pricingTier: z.string().optional(),
        isGift: z.boolean().optional(),
        giftRecipient: z.string().optional(),
        giftMessage: z.string().max(500).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const product = getProductById(input.productId);
        if (!product) throw new Error("Product not found");
        if (!product.stripePriceId) throw new Error("Product price not configured");
        const userEmail = ctx.user?.email || input.customerEmail;
        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: [{ price: product.stripePriceId, quantity: 1 }],
          allow_promotion_codes: true,
          customer_email: userEmail || undefined,
          success_url: `${input.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${input.origin}/harvest-stand`,
          metadata: {
            product_id: product.id,
            product_name: input.variety ? `${input.variety} — ${input.stemSize}-stem bunch` : product.name,
            product_type: product.type,
            variety: input.variety || "",
            stem_size: input.stemSize?.toString() || "",
            pricing_tier: input.pricingTier || "",
            user_id: ctx.user?.id?.toString() || "",
            customer_email: userEmail || "",
            is_gift: input.isGift ? "true" : "false",
            gift_recipient: input.giftRecipient || "",
            gift_message: (input.giftMessage || "").slice(0, 500),
          },
          ...(ctx.user?.id ? { client_reference_id: ctx.user.id.toString() } : {}),
        });
        return { checkoutUrl: session.url };
      }),

    // Multi-line-item cart checkout — one Stripe price per cart item
    createCartSession: publicProcedure
      .input(z.object({
        items: z.array(z.object({
          quantity: z.number().int().min(1),
          variety: z.string(),
          stemSize: z.number(),
          pricingTier: z.string(),
          priceCents: z.number().int().min(50), // inline price — no pre-created price ID needed
        })).min(1),
        origin: z.string().url(),
        customerEmail: z.string().email().optional(),
        isGift: z.boolean().optional(),
        giftRecipient: z.string().optional(),
        giftMessage: z.string().max(500).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const userEmail = ctx.user?.email || input.customerEmail;
        const itemsSummary = input.items
          .map((i) => `${i.variety} ${i.stemSize}-stem x${i.quantity}`)
          .join(", ");

        // Use inline price_data — no pre-created Stripe prices needed
        const lineItems = input.items.map((item) => ({
          price_data: {
            currency: "usd",
            unit_amount: item.priceCents,
            product_data: {
              name: `${item.variety} — ${item.stemSize}-Stem Bunch`,
              description: `${item.pricingTier.charAt(0).toUpperCase() + item.pricingTier.slice(1)} tier · Farm-grown at Red Dirt Blooms`,
            },
          },
          quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          payment_method_types: ["card"],
          line_items: lineItems,
          allow_promotion_codes: true,
          customer_email: userEmail || undefined,
          success_url: `${input.origin}/order-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${input.origin}/harvest-stand`,
          metadata: {
            order_type: "cart",
            items: itemsSummary.slice(0, 500),
            item_count: input.items.length.toString(),
            user_id: ctx.user?.id?.toString() || "",
            customer_email: userEmail || "",
            is_gift: input.isGift ? "true" : "false",
            gift_recipient: input.giftRecipient || "",
            gift_message: (input.giftMessage || "").slice(0, 500),
          },
          ...(ctx.user?.id ? { client_reference_id: ctx.user.id.toString() } : {}),
        });
        return { checkoutUrl: session.url };
      }),

    getOrders: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(orders).where(eq(orders.userId, ctx.user.id));
    }),
  }),

  dusty: router({
    chat: publicProcedure
      .input(z.object({
        message: z.string().min(1).max(500),
        history: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const systemPrompt = `You are Dusty, the friendly AI assistant for Red Dirt Blooms — an organic flower farm in Oklahoma City, Oklahoma. Named after Oklahoma's famous dusty red roads.

Personality: Warm, friendly, authentically Oklahoman. Use phrases like "Well hey there!", "You bet!", "y'all". Enthusiastic about Oklahoma and local community.

About Red Dirt Blooms:
- 100% organic flower farm in OKC metro, Oklahoma
- Grows: zinnias, dahlias, sunflowers, lisianthus, celosia, strawflowers, gomphrena, amaranth
- Fresh season: May–October. Off-season: dried flowers, wreaths, seeds
- Products: Harvest Bouquet ($28), Zinnia Bunch ($18), Dahlia Bunch ($32)
- Bloom Share subscriptions: Weekly Bloom Share ($396, 12 bouquets, June–October, weekly cadence weather-permitting, all 12 bouquets guaranteed), Bi-Weekly Bloom Share ($210, 6 bouquets, June–October, bi-weekly cadence weather-permitting, all 6 bouquets guaranteed). We aim for regular cadence but Mother Nature sometimes has a different plan — the total bouquet count is always honored before season end.
- Dried: Prairie Wreath ($45), Everlasting Bouquet ($35), Zinnia Seeds ($8)
- Pickup: Thu & Fri 10am–5pm during harvest season, OKC metro area
- Local delivery: OKC, Edmond, Norman, Yukon, Mustang, Choctaw, Moore, Midwest City
- Wholesale for local florists: apply via Florist Portal (footer)
- Bloom Watch: email list notified when varieties are ready to harvest
- Bouquet care: trim at 45°, clean water, away from sunlight, change water every 2 days — lasts 7–10 days
- Contact: hello@reddirtblooms.com

Keep responses concise (2-4 sentences). Be helpful and direct people to the right page when relevant.`;

        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...(input.history || []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
          { role: "user" as const, content: input.message },
        ];

        const response = await invokeLLM({ messages });
        const rawContent = response.choices?.[0]?.message?.content;
        let reply: string;
        if (typeof rawContent === "string") {
          reply = rawContent;
        } else if (Array.isArray(rawContent)) {
          reply = rawContent.filter((c) => c.type === "text").map((c) => (c as { type: "text"; text: string }).text).join("") || "Well shoot, I hit a snag! Try asking me again or reach out at hello@reddirtblooms.com 🌸";
        } else {
          reply = "Well shoot, I hit a snag! Try asking me again or reach out at hello@reddirtblooms.com 🌸";
        }
        return { reply };
      }),
  }),

  bouquet: router({
    submitInquiry: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(256),
        email: z.string().email(),
        phone: z.string().optional(),
        eventType: z.string().optional(),
        eventDate: z.string().optional(),
        guestCount: z.string().optional(),
        budget: z.string().optional(),
        vision: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await notifyOwner({
          title: `🌸 Bouquet Bar Inquiry — ${input.eventType ?? "Event"} — ${input.name}`,
          content: `**New Bouquet Bar Inquiry**\n\n**Name:** ${input.name}\n**Email:** ${input.email}\n**Phone:** ${input.phone || "Not provided"}\n**Event Type:** ${input.eventType || "Not specified"}\n**Event Date:** ${input.eventDate || "Not specified"}\n**Guest Count:** ${input.guestCount || "Not specified"}\n**Budget:** ${input.budget || "Not specified"}\n\n**Vision:**\n${input.vision || "Not provided"}`,
        });
        // Fire-and-forget GHL sync — tag as bouquet-bar-inquiry
        syncContactToGHL({
          email: input.email,
          name: input.name,
          phone: input.phone || null,
          tags: ["bouquet-bar-inquiry"],
          source: "Bouquet Bar Inquiry Form",
          customFields: [
            ...(input.eventType ? [{ key: "event_type", field_value: input.eventType }] : []),
            ...(input.eventDate ? [{ key: "event_date", field_value: input.eventDate }] : []),
            ...(input.budget ? [{ key: "budget", field_value: input.budget }] : []),
          ],
        }).catch((err) => console.error("[GHL] bouquet.submitInquiry sync error:", err));
        return { success: true };
      }),
  }),

  florist: router({
    submitApplication: publicProcedure
      .input(z.object({
        businessName: z.string().min(2).max(256),
        contactName: z.string().min(2).max(256),
        email: z.string().email(),
        phone: z.string().optional(),
        city: z.string().optional(),
        monthlyVolume: z.string().optional(),
        flowerTypes: z.string().optional(),
        website: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.insert(floristApplications).values({
          businessName: input.businessName,
          contactName: input.contactName,
          email: input.email,
          phone: input.phone || null,
          city: input.city || null,
          monthlyVolume: input.monthlyVolume || null,
          flowerTypes: input.flowerTypes || null,
          message: input.message || null,
          status: "pending",
        });
        await notifyOwner({
          title: "🌸 New Florist Application!",
          content: `${input.businessName} (${input.contactName}) applied for the wholesale program from ${input.city || "unknown city"}. Email: ${input.email}`,
        });
        // Fire-and-forget GHL sync — creates contact tagged florist-applicant
        syncFloristToGHL({
          email: input.email,
          contactName: input.contactName,
          businessName: input.businessName,
          phone: input.phone || null,
          city: input.city || null,
          website: input.website || null,
          status: "pending",
        }).catch((err) => console.error("[GHL] florist.submitApplication sync error:", err));
        return { success: true, message: "Your application has been submitted! We'll be in touch within 2 business days." };
      }),
  }),

  diary: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(diaryPosts).where(eq(diaryPosts.published, true)).orderBy(desc(diaryPosts.publishedAt));
    }),
    listAll: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) return [];
      return db.select().from(diaryPosts).orderBy(desc(diaryPosts.createdAt));
    }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(256),
        body: z.string().optional(),
        videoUrl: z.string().url().optional().or(z.literal("")),
        thumbnailUrl: z.string().url().optional().or(z.literal("")),
        tags: z.string().optional(),
        published: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.insert(diaryPosts).values({
          title: input.title,
          body: input.body || null,
          videoUrl: input.videoUrl || null,
          thumbnailUrl: input.thumbnailUrl || null,
          tags: input.tags || null,
          published: input.published,
          publishedAt: input.published ? new Date() : null,
        });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().min(1).max(256).optional(),
        body: z.string().optional(),
        videoUrl: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        tags: z.string().optional(),
        published: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        const updateData: Record<string, unknown> = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.body !== undefined) updateData.body = input.body;
        if (input.videoUrl !== undefined) updateData.videoUrl = input.videoUrl;
        if (input.thumbnailUrl !== undefined) updateData.thumbnailUrl = input.thumbnailUrl;
        if (input.tags !== undefined) updateData.tags = input.tags;
        if (input.published !== undefined) {
          updateData.published = input.published;
          if (input.published) updateData.publishedAt = new Date();
        }
        await db.update(diaryPosts).set(updateData).where(eq(diaryPosts.id, input.id));
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.delete(diaryPosts).where(eq(diaryPosts.id, input.id));
        return { success: true };
      }),
  }),

  admin: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) return { subscribers: 0, orders: 0, floristApps: 0, diaryPosts: 0 };
      const [subCount] = await db.select({ count: count() }).from(bloomSubscribers);
      const [orderCount] = await db.select({ count: count() }).from(orders);
      const [floristCount] = await db.select({ count: count() }).from(floristApplications).where(eq(floristApplications.status, "pending"));
      const [postCount] = await db.select({ count: count() }).from(diaryPosts);
      return {
        subscribers: subCount?.count ?? 0,
        orders: orderCount?.count ?? 0,
        floristApps: floristCount?.count ?? 0,
        diaryPosts: postCount?.count ?? 0,
      };
    }),
    getSubscribers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) return [];
      return db.select().from(bloomSubscribers).orderBy(desc(bloomSubscribers.createdAt));
    }),
    getOrders: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) return [];
      return db.select().from(orders).orderBy(desc(orders.createdAt));
    }),
    getFloristApps: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) return [];
      return db.select().from(floristApplications).orderBy(desc(floristApplications.createdAt));
    }),
    updateFloristStatus: protectedProcedure
      .input(z.object({ email: z.string().email(), status: z.enum(["pending", "approved", "declined"]), adminNotes: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db
          .update(floristApplications)
          .set({ status: input.status, adminNotes: input.adminNotes ?? null })
          .where(eq(floristApplications.email, input.email));
        // Fire-and-forget GHL sync on every status change
        const [app] = await db.select().from(floristApplications).where(eq(floristApplications.email, input.email));
        if (app) {
          syncFloristToGHL({
            email: app.email,
            contactName: app.contactName,
            businessName: app.businessName,
            phone: app.phone ?? null,
            city: app.city ?? null,
            website: null,
            status: input.status,
          }).catch((err) => console.error("[GHL] updateFloristStatus sync error:", err));
        }
        return { success: true };
      }),
    saveFloristNotes: protectedProcedure
      .input(z.object({ email: z.string().email(), adminNotes: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db
          .update(floristApplications)
          .set({ adminNotes: input.adminNotes })
          .where(eq(floristApplications.email, input.email));
        return { success: true };
      }),

    /** Bulk-sync all florist applications to GHL — creates/updates contacts with correct status tags */
    syncAllFloristsToGHL: protectedProcedure.mutation(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      const apps = await db.select().from(floristApplications).orderBy(desc(floristApplications.createdAt));
      let synced = 0;
      let failed = 0;
      for (const app of apps) {
        try {
          await syncFloristToGHL({
            email: app.email,
            contactName: app.contactName,
            businessName: app.businessName,
            phone: app.phone ?? undefined,
            city: app.city ?? undefined,
            website: undefined,
            status: (app.status as "pending" | "approved" | "declined") ?? "pending",
          });
          synced++;
        } catch (e) {
          console.error("[GHL] Bulk sync failed for", app.email, e);
          failed++;
        }
      }
      return { synced, failed, total: apps.length };
    }),
    submitFloristApplication: publicProcedure
      .input(z.object({
        contactName: z.string().min(1),
        businessName: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        city: z.string().optional(),
        website: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db.insert(floristApplications).values({
          contactName: input.contactName,
          businessName: input.businessName,
          email: input.email,
          phone: input.phone || undefined,
          city: input.city || undefined,
          message: input.message || undefined,
          status: "pending",
        });
        return { success: true };
      }),
    getSuggestions: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") throw new Error("Forbidden");
      const db = await getDb();
      if (!db) return [];
      return db.select().from(floristSuggestions).orderBy(desc(floristSuggestions.createdAt));
    }),
    updateSuggestionStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "reviewed", "actioned"]),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "admin") throw new Error("Forbidden");
        const db = await getDb();
        if (!db) throw new Error("Database unavailable");
        await db
          .update(floristSuggestions)
          .set({ status: input.status, adminNotes: input.adminNotes })
          .where(eq(floristSuggestions.id, input.id));
        return { success: true };
      }),
  }),
});
export type AppRouter = typeof appRouter;


