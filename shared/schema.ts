import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  real,
  unique,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ===== SESSION STORAGE (Required for Replit Auth) =====
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// ===== USERS TABLE (Email/password auth with verification codes) =====
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"), // Hashed password (nullable for migration from Replit Auth)
  emailVerified: boolean("email_verified").default(false).notNull(),
  verificationCode: varchar("verification_code", { length: 6 }), // 6-digit code
  verificationCodeExpiry: timestamp("verification_code_expiry"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  username: varchar("username").unique(),
  bio: text("bio"),
  instagramUrl: varchar("instagram_url"),
  tiktokUrl: varchar("tiktok_url"),
  youtubeUrl: varchar("youtube_url"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  recommendations: many(recommendations),
  categories: many(categories),
  follows: many(follows, { relationName: "follower" }),
  followers: many(follows, { relationName: "following" }),
  likes: many(likes),
  comments: many(comments),
}));

// ===== CATEGORIES TABLE =====
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }), // null for pre-built categories
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  unique("unique_category").on(table.name, table.userId),
]);

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  recommendations: many(recommendations),
}));

// ===== RECOMMENDATIONS TABLE =====
export const recommendations = pgTable("recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url"), // Optional to allow testing without image upload
  rating: integer("rating").notNull(), // 1-5
  proTip: varchar("pro_tip", { length: 500 }), // User's extra tip (e.g., "Make sure to arrive early")
  categoryId: varchar("category_id").references(() => categories.id),
  location: varchar("location", { length: 500 }),
  latitude: real("latitude"),
  longitude: real("longitude"),
  externalUrl: text("external_url"),
  isPrivate: boolean("is_private").default(false).notNull(), // Public by default
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_recommendations_user").on(table.userId),
  index("idx_recommendations_category").on(table.categoryId),
  index("idx_recommendations_created").on(table.createdAt),
]);

export const recommendationsRelations = relations(recommendations, ({ one, many }) => ({
  user: one(users, {
    fields: [recommendations.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [recommendations.categoryId],
    references: [categories.id],
  }),
  tags: many(recommendationTags),
  likes: many(likes),
  curatorRecs: many(curatorRecs),
  comments: many(comments),
}));

// ===== TAGS TABLE =====
export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 50 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tagsRelations = relations(tags, ({ many }) => ({
  recommendations: many(recommendationTags),
}));

// ===== RECOMMENDATION_TAGS (Join Table) =====
export const recommendationTags = pgTable("recommendation_tags", {
  recommendationId: varchar("recommendation_id").notNull().references(() => recommendations.id, { onDelete: 'cascade' }),
  tagId: varchar("tag_id").notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (table) => [
  index("idx_rec_tags_rec").on(table.recommendationId),
  index("idx_rec_tags_tag").on(table.tagId),
]);

export const recommendationTagsRelations = relations(recommendationTags, ({ one }) => ({
  recommendation: one(recommendations, {
    fields: [recommendationTags.recommendationId],
    references: [recommendations.id],
  }),
  tag: one(tags, {
    fields: [recommendationTags.tagId],
    references: [tags.id],
  }),
}));

// ===== FOLLOWS TABLE =====
export const follows = pgTable("follows", {
  followerId: varchar("follower_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: varchar("following_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: unique("follows_pk").on(table.followerId, table.followingId),
  followerIdx: index("idx_follows_follower").on(table.followerId),
  followingIdx: index("idx_follows_following").on(table.followingId),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "following",
  }),
}));

// ===== LIKES TABLE =====
export const likes = pgTable("likes", {
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  recommendationId: varchar("recommendation_id").notNull().references(() => recommendations.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: unique("likes_pk").on(table.userId, table.recommendationId),
  userIdx: index("idx_likes_user").on(table.userId),
  recIdx: index("idx_likes_rec").on(table.recommendationId),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.userId],
    references: [users.id],
  }),
  recommendation: one(recommendations, {
    fields: [likes.recommendationId],
    references: [recommendations.id],
  }),
}));

// ===== CURATOR_RECS (Admin-curated recommendations) =====
export const curatorRecs = pgTable("curator_recs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  recommendationId: varchar("recommendation_id").notNull().references(() => recommendations.id, { onDelete: 'cascade' }),
  curatedBy: varchar("curated_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_curator_recs_rec").on(table.recommendationId),
]);

export const curatorRecsRelations = relations(curatorRecs, ({ one }) => ({
  recommendation: one(recommendations, {
    fields: [curatorRecs.recommendationId],
    references: [recommendations.id],
  }),
  curator: one(users, {
    fields: [curatorRecs.curatedBy],
    references: [users.id],
  }),
}));

// ===== ADMIN RECOMMENDS TABLE (CUR8tr Recommends - Admin-curated featured cards) =====
export const adminRecommends = pgTable("admin_recommends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  subtitle: varchar("subtitle", { length: 300 }),
  imageUrl: text("image_url").notNull(),
  externalUrl: text("external_url").notNull(),
  price: varchar("price", { length: 50 }), // Optional price field (e.g., "25" for $25)
  isVisible: boolean("is_visible").default(true).notNull(),
  sectionId: varchar("section_id").references(() => sections.id, { onDelete: 'set null' }),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_admin_recommends_visible").on(table.isVisible),
  index("idx_admin_recommends_created").on(table.createdAt),
  index("idx_admin_recommends_section").on(table.sectionId),
]);

export const adminRecommendsRelations = relations(adminRecommends, ({ one }) => ({
  creator: one(users, {
    fields: [adminRecommends.createdBy],
    references: [users.id],
  }),
  section: one(sections, {
    fields: [adminRecommends.sectionId],
    references: [sections.id],
  }),
}));

// ===== COMMENTS TABLE =====
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  recommendationId: varchar("recommendation_id").notNull().references(() => recommendations.id, { onDelete: 'cascade' }),
  parentId: varchar("parent_id").references((): any => comments.id, { onDelete: 'cascade' }), // Self-reference for replies
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_comments_recommendation").on(table.recommendationId),
  index("idx_comments_user").on(table.userId),
  index("idx_comments_parent").on(table.parentId),
]);

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  recommendation: one(recommendations, {
    fields: [comments.recommendationId],
    references: [recommendations.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "replies",
  }),
  replies: many(comments, {
    relationName: "replies",
  }),
}));

// ===== SECTIONS TABLE (for organizing CUR8tr Recs page) =====
export const sections = pgTable("sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  subtitle: varchar("subtitle", { length: 300 }),
  displayOrder: integer("display_order").notNull().default(0),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_sections_order").on(table.displayOrder),
]);

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  creator: one(users, {
    fields: [sections.createdBy],
    references: [users.id],
  }),
  sectionRecommendations: many(sectionRecommendations),
}));

// ===== SECTION RECOMMENDATIONS (mapping table) =====
export const sectionRecommendations = pgTable("section_recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").notNull().references(() => sections.id, { onDelete: 'cascade' }),
  recommendationId: varchar("recommendation_id").notNull().references(() => recommendations.id, { onDelete: 'cascade' }),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("idx_section_recs_section").on(table.sectionId),
  index("idx_section_recs_order").on(table.sectionId, table.displayOrder),
  unique("unique_section_rec").on(table.sectionId, table.recommendationId),
]);

export const sectionRecommendationsRelations = relations(sectionRecommendations, ({ one }) => ({
  section: one(sections, {
    fields: [sectionRecommendations.sectionId],
    references: [sections.id],
  }),
  recommendation: one(recommendations, {
    fields: [sectionRecommendations.recommendationId],
    references: [recommendations.id],
  }),
}));

// ===== APP SETTINGS TABLE =====
export const appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ===== TYPES AND SCHEMAS =====
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertCategory = typeof categories.$inferInsert;
export type Category = typeof categories.$inferSelect;

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  tags: z.array(z.string()).optional(),
  proTip: z.string().max(500, "Pro Tip must be 500 characters or less").optional().or(z.literal("")),
  // Allow both URLs and object storage paths (e.g., /objects/uploads/...)
  // Optional to allow testing without image upload
  imageUrl: z.string().refine(
    (val) => val.startsWith('/objects/') || val.startsWith('http://') || val.startsWith('https://'),
    { message: "Image must be a valid URL or object storage path" }
  ).optional().or(z.literal("")),
});

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

export type Tag = typeof tags.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type CuratorRec = typeof curatorRecs.$inferSelect;

export const insertAdminRecommendSchema = createInsertSchema(adminRecommends).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAdminRecommend = z.infer<typeof insertAdminRecommendSchema>;
export type AdminRecommend = typeof adminRecommends.$inferSelect;

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Update profile schema
export const updateProfileSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  bio: z.string().max(500).optional(),
  profileImageUrl: z.string().refine(
    (val) => !val || val.startsWith('/objects/') || val.startsWith('http://') || val.startsWith('https://'),
    { message: "Avatar must be a valid URL or object storage path" }
  ).optional().or(z.literal('')),
  instagramUrl: z.string().url().optional().or(z.literal('')),
  tiktokUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;

// Registration schema (for new user signup)
export const registerUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;

// Login schema
export const loginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export type LoginUser = z.infer<typeof loginUserSchema>;

// Email verification schema
export const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export type VerifyEmail = z.infer<typeof verifyEmailSchema>;

// Resend verification code schema
export const resendCodeSchema = z.object({
  email: z.string().email(),
});

export type ResendCode = z.infer<typeof resendCodeSchema>;

// Create category schema
export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export type CreateCategory = z.infer<typeof createCategorySchema>;

// Featured user with stats
export type FeaturedUser = User & {
  recommendationsCount: number;
  followersCount: number;
};

// Section schemas
export const insertSectionSchema = createInsertSchema(sections).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSection = z.infer<typeof insertSectionSchema>;
export type Section = typeof sections.$inferSelect;

export type SectionRecommendation = typeof sectionRecommendations.$inferSelect;

// App settings schema
export type AppSetting = typeof appSettings.$inferSelect;

// Section with recommendations
export type SectionWithRecommendations = Section & {
  recommendations: Recommendation[];
  adminRecommends: AdminRecommend[];
};
