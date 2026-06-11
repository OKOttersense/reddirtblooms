import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Bloom Watch subscribers — email capture for harvest notifications.
 * Does NOT require a user account.
 */
export const bloomSubscribers = mysqlTable("bloom_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 128 }),
  source: varchar("source", { length: 64 }).default("homepage"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BloomSubscriber = typeof bloomSubscribers.$inferSelect;
export type InsertBloomSubscriber = typeof bloomSubscribers.$inferInsert;

/**
 * Orders — tracks Stripe checkout sessions and fulfillment.
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  stripeSessionId: varchar("stripeSessionId", { length: 128 }).notNull().unique(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerName: varchar("customerName", { length: 256 }),
  productName: varchar("productName", { length: 256 }),
  productType: mysqlEnum("productType", ["bouquet", "subscription", "dried", "seeds", "bunch"]).default("bouquet"),
  amountCents: int("amountCents"),
  status: mysqlEnum("status", ["pending", "paid", "fulfilled", "cancelled"]).default("pending").notNull(),
  userId: int("userId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;


/**
 * Florist Portal applications — wholesale program inquiries.
 */
export const floristApplications = mysqlTable("florist_applications", {
  id: int("id").autoincrement().primaryKey(),
  businessName: varchar("businessName", { length: 256 }).notNull(),
  contactName: varchar("contactName", { length: 256 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  city: varchar("city", { length: 128 }),
  monthlyVolume: varchar("monthlyVolume", { length: 64 }),
  flowerTypes: text("flowerTypes"),
  message: text("message"),
  adminNotes: text("adminNotes"),
  status: mysqlEnum("status", ["pending", "approved", "declined"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FloristApplication = typeof floristApplications.$inferSelect;
export type InsertFloristApplication = typeof floristApplications.$inferInsert;

/**
 * Bloom Diary posts — videos and blog entries posted by the farm owner.
 */
export const diaryPosts = mysqlTable("diary_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  body: text("body"),
  videoUrl: varchar("videoUrl", { length: 512 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  tags: varchar("tags", { length: 256 }),
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type DiaryPost = typeof diaryPosts.$inferSelect;
export type InsertDiaryPost = typeof diaryPosts.$inferInsert;

/**
 * Florist Accounts — wholesale partners with separate email/password auth.
 * Admin must approve before portal access is granted.
 */
export const floristAccounts = mysqlTable("florist_accounts", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(),
  businessName: varchar("businessName", { length: 256 }).notNull(),
  contactName: varchar("contactName", { length: 256 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  city: varchar("city", { length: 128 }),
  website: varchar("website", { length: 512 }),
  status: mysqlEnum("status", ["pending", "approved", "declined"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FloristAccount = typeof floristAccounts.$inferSelect;
export type InsertFloristAccount = typeof floristAccounts.$inferInsert;

/**
 * Harvest Listings — weekly harvest board entries posted by admin.
 * Each listing has a photo, variety name, price per bunch, and available quantity.
 */
export const harvestListings = mysqlTable("harvest_listings", {
  id: int("id").autoincrement().primaryKey(),
  variety: varchar("variety", { length: 256 }).notNull(),
  color: varchar("color", { length: 100 }).default("Mixed"),
  description: text("description"),
  pricePerBunch: decimal("pricePerBunch", { precision: 8, scale: 2 }).notNull(),
  // Pricing tier for the new farm-direct bunch model
  pricingTier: mysqlEnum("pricingTier", ["premium", "specialty", "focal"]).default("premium").notNull(),
  // Per-size bunch prices (null = use tier default)
  price2Stem: decimal("price2Stem", { precision: 8, scale: 2 }),
  price4Stem: decimal("price4Stem", { precision: 8, scale: 2 }),
  price6Stem: decimal("price6Stem", { precision: 8, scale: 2 }),
  focalPrice: decimal("focalPrice", { precision: 8, scale: 2 }),
  quantityAvailable: int("quantityAvailable").notNull().default(0),
  quantitySold: int("quantitySold").notNull().default(0),
  imageKey: varchar("imageKey", { length: 512 }),
  imageUrl: varchar("imageUrl", { length: 512 }),
  isPublished: boolean("isPublished").default(false).notNull(),
  isSoldOut: boolean("isSoldOut").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  season: varchar("season", { length: 32 }),
  stripeProductId2Stem: varchar("stripeProductId2Stem", { length: 255 }),
  stripeProductId4Stem: varchar("stripeProductId4Stem", { length: 255 }),
  stripeProductId6Stem: varchar("stripeProductId6Stem", { length: 255 }),
  stripePriceId2Stem: varchar("stripePriceId2Stem", { length: 255 }),
  stripePriceId4Stem: varchar("stripePriceId4Stem", { length: 255 }),
  stripePriceId6Stem: varchar("stripePriceId6Stem", { length: 255 }),
  syncedToStripe: boolean("syncedToStripe").default(false),
  lastSyncedAt: timestamp("lastSyncedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HarvestListing = typeof harvestListings.$inferSelect;
export type InsertHarvestListing = typeof harvestListings.$inferInsert;

/**
 * Harvest Orders — wholesale orders placed by approved florists.
 */
export const harvestOrders = mysqlTable("harvest_orders", {
  id: int("id").autoincrement().primaryKey(),
  floristId: int("floristId").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "invoiced", "paid", "cancelled"]).default("pending").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["stripe", "invoice"]).default("stripe").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 128 }),
  stripeSessionId: varchar("stripeSessionId", { length: 128 }),
  totalAmountCents: int("totalAmountCents").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type HarvestOrder = typeof harvestOrders.$inferSelect;
export type InsertHarvestOrder = typeof harvestOrders.$inferInsert;

/**
 * Harvest Order Items — line items within a wholesale order.
 */
export const harvestOrderItems = mysqlTable("harvest_order_items", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  listingId: int("listingId").notNull(),
  quantity: int("quantity").notNull(),
  pricePerBunchCents: int("pricePerBunchCents").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type HarvestOrderItem = typeof harvestOrderItems.$inferSelect;
export type InsertHarvestOrderItem = typeof harvestOrderItems.$inferInsert;

/**
 * Password Reset Tokens — one-time tokens for florist password reset.
 * Expires after 1 hour; invalidated after use.
 */
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  floristId: int("floristId").notNull(),
  token: varchar("token", { length: 128 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

/**
 * Portfolio Items — past work photos shown to prospective florists.
 * Admin uploads photos with variety name, season, and description.
 * Publicly visible (no auth required) on /florist-portfolio.
 */
export const portfolioItems = mysqlTable("portfolio_items", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  variety: varchar("variety", { length: 256 }).notNull(),
  season: mysqlEnum("season", ["spring", "summer", "fall", "winter", "year-round"]).default("summer").notNull(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 1024 }),
  imageKey: varchar("imageKey", { length: 512 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PortfolioItem = typeof portfolioItems.$inferSelect;
export type InsertPortfolioItem = typeof portfolioItems.$inferInsert;

/**
 * Portfolio Favorites — florists can heart/save portfolio items they love.
 * Requires an approved florist_accounts session.
 */
export const portfolioFavorites = mysqlTable("portfolio_favorites", {
  id: int("id").autoincrement().primaryKey(),
  floristAccountId: int("floristAccountId").notNull(),
  portfolioItemId: int("portfolioItemId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type PortfolioFavorite = typeof portfolioFavorites.$inferSelect;
export type InsertPortfolioFavorite = typeof portfolioFavorites.$inferSelect;

/**
 * Gallery Photos — managed from the admin panel, displayed on the public /gallery page.
 * Supports variety tagging, category assignment, sort order, and S3-backed photo storage.
 */
export const galleryPhotos = mysqlTable("gallery_photos", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  caption: text("caption"),
  category: varchar("category", { length: 64 }).notNull().default("The Farm"),
  imageUrl: varchar("imageUrl", { length: 512 }),
  imageKey: varchar("imageKey", { length: 512 }),
  variety: varchar("variety", { length: 256 }),
  varietyLatin: varchar("varietyLatin", { length: 256 }),
  varietyVaseLife: varchar("varietyVaseLife", { length: 64 }),
  varietyStemLength: varchar("varietyStemLength", { length: 64 }),
  varietySeason: varchar("varietySeason", { length: 128 }),
  varietyDesignUse: text("varietyDesignUse"),
  varietyTags: varchar("varietyTags", { length: 256 }),
  varietyColor: varchar("varietyColor", { length: 16 }),
  sortOrder: int("sortOrder").default(0).notNull(),
  isPublished: boolean("isPublished").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type InsertGalleryPhoto = typeof galleryPhotos.$inferInsert;

/**
 * Florist Suggestions — variety requests, feedback, and special notes from approved florists.
 * Visible to admin in the /admin dashboard under the Suggestions tab.
 */
export const floristSuggestions = mysqlTable("florist_suggestions", {
  id: int("id").autoincrement().primaryKey(),
  floristId: int("floristId").notNull(),
  floristEmail: varchar("floristEmail", { length: 320 }),
  floristBusinessName: varchar("floristBusinessName", { length: 256 }),
  message: text("message").notNull(),
  category: mysqlEnum("category", ["variety-request", "feedback", "special-order", "general"]).default("general").notNull(),
  status: mysqlEnum("status", ["new", "reviewed", "actioned"]).default("new").notNull(),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type FloristSuggestion = typeof floristSuggestions.$inferSelect;
export type InsertFloristSuggestion = typeof floristSuggestions.$inferInsert;
