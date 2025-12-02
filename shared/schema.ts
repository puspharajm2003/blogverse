import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  plan: varchar("plan").notNull().default("free"), // free, pro, enterprise
  isAdmin: boolean("is_admin").notNull().default(false), // Admin user with all features
  bio: text("bio"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Blogs table
export const blogs = pgTable("blogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image"), // Blog hero/cover image
  slug: varchar("slug").notNull().unique(),
  domain: varchar("domain"),
  status: varchar("status").notNull().default("active"), // active, draft
  theme: text("theme").default("default"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Articles table
export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  blogId: varchar("blog_id").notNull().references(() => blogs.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  coverImage: text("cover_image"),
  slug: varchar("slug").notNull(),
  tags: text("tags").array(),
  status: varchar("status").notNull().default("draft"), // draft, published, scheduled
  publishedAt: timestamp("published_at"),
  scheduledPublishAt: timestamp("scheduled_publish_at"), // For scheduled publishing
  authorBio: text("author_bio"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Analytics events table
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id),
  eventType: varchar("event_type").notNull(), // pageview, scroll, click, etc
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Chat messages table for AI Assistant
export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").notNull(), // user, assistant
  message: text("message").notNull(),
  generationType: varchar("generation_type"), // section, full, outline, title, tags, meta
  topic: text("topic"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Article versions table for version history
export const articleVersions = pgTable("article_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  versionNumber: integer("version_number").notNull(),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  changeDescription: text("change_description"),
});

// Comments table for article discussions with moderation
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id),
  authorName: text("author_name").notNull(),
  authorEmail: text("author_email").notNull(),
  content: text("content").notNull(),
  approved: boolean("approved").notNull().default(false), // approved status for moderation
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Collaborative editors table
export const collaborators = pgTable("collaborators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  role: varchar("role").notNull().default("editor"), // viewer, editor, admin
  addedAt: timestamp("added_at").notNull().default(sql`now()`),
  lastActiveAt: timestamp("last_active_at"),
});

// Advanced analytics events table for detailed engagement tracking
export const advancedAnalyticsEvents = pgTable("advanced_analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id),
  sessionId: text("session_id").notNull(),
  eventType: varchar("event_type").notNull(), // scroll, timeOnPage, exitIntent, engagement, scrollDepth
  scrollDepthPercent: integer("scroll_depth_percent"), // 0-100
  timeOnPageSeconds: integer("time_on_page_seconds"),
  engagementScore: integer("engagement_score"), // 0-100 based on interactions
  referrer: text("referrer"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Reading history table for personalized feed
export const readingHistory = pgTable("reading_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  articleId: varchar("article_id").notNull().references(() => articles.id),
  readingTimeSeconds: integer("reading_time_seconds").default(0),
  scrollDepth: integer("scroll_depth").default(0), // 0-100
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// User preferences table for personalized content
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  preferredTags: text("preferred_tags").array().default(sql`ARRAY[]::text[]`),
  readingLevel: varchar("reading_level").default("intermediate"), // beginner, intermediate, advanced
  emailNotifications: boolean("email_notifications").default(true),
  weeklyDigest: boolean("weekly_digest").default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Achievements table
export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(), // emoji or icon name
  requirement: integer("requirement").notNull(), // number of articles needed or milestone
  requirementType: varchar("requirement_type").notNull(), // articles_published, consecutive_days, total_views, etc
  tier: varchar("tier").notNull().default("bronze"), // bronze, silver, gold, platinum
  points: integer("points").notNull().default(10),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// User achievements table (join table for users and achievements)
export const userAchievements = pgTable("user_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  achievementId: varchar("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").notNull().default(sql`now()`),
  progress: integer("progress").default(0), // 0-100 for partial progress
});

// User streaks table for tracking consecutive content creation days
export const userStreaks = pgTable("user_streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  currentStreak: integer("current_streak").default(0), // consecutive days
  longestStreak: integer("longest_streak").default(0), // best streak ever
  lastPublishDate: timestamp("last_publish_date"), // when they last published
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Plagiarism check results table
export const plagiarismChecks = pgTable("plagiarism_checks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  overallScore: integer("overall_score").notNull(), // 0-100
  uniqueScore: integer("unique_score").notNull(), // 0-100
  matchCount: integer("match_count").notNull().default(0),
  matches: jsonb("matches").default(sql`'[]'::jsonb`), // Array of plagiarism matches
  status: varchar("status").notNull().default("completed"), // completed, pending, error
  checkedAt: timestamp("checked_at").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// User feedback table
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  category: varchar("category").notNull(), // bug, feature, improvement, other
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  attachments: text("attachments").array().default(sql`ARRAY[]::text[]`),
  status: varchar("status").notNull().default("open"), // open, in-progress, resolved, closed
  priority: varchar("priority").default("normal"), // low, normal, high, urgent
  rating: integer("rating"), // 1-5 star rating
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Article bookmarks table
export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  articleId: varchar("article_id").notNull().references(() => articles.id),
  collectionName: varchar("collection_name").default("reading-list"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // comment_new, article_update, achievement_unlocked, etc
  title: text("title").notNull(),
  message: text("message").notNull(),
  relatedArticleId: varchar("related_article_id").references(() => articles.id),
  relatedCommentId: varchar("related_comment_id"),
  read: boolean("read").default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// User notification preferences table
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  newComments: boolean("new_comments").default(true),
  articleUpdates: boolean("article_updates").default(true),
  achievementUnlocked: boolean("achievement_unlocked").default(true),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Learning path/onboarding progress table
export const learningProgress = pgTable("learning_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  completedLessons: text("completed_lessons").array().default(sql`ARRAY[]::text[]`),
  currentLesson: varchar("current_lesson"),
  progressPercent: integer("progress_percent").default(0),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  displayName: true,
}).extend({
  plan: z.enum(["free", "pro", "enterprise"]).default("free").optional(),
});

export const insertBlogSchema = createInsertSchema(blogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertArticleVersionSchema = createInsertSchema(articleVersions).omit({
  id: true,
  createdAt: true,
});

export const insertCollaboratorSchema = createInsertSchema(collaborators).omit({
  id: true,
  addedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertReadingHistorySchema = createInsertSchema(readingHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Blog = typeof blogs.$inferSelect;
export type InsertBlog = z.infer<typeof insertBlogSchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type ArticleVersion = typeof articleVersions.$inferSelect;
export type InsertArticleVersion = z.infer<typeof insertArticleVersionSchema>;

export type Collaborator = typeof collaborators.$inferSelect;
export type InsertCollaborator = z.infer<typeof insertCollaboratorSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type ReadingHistory = typeof readingHistory.$inferSelect;
export type InsertReadingHistory = z.infer<typeof insertReadingHistorySchema>;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type PlagiarismCheck = typeof plagiarismChecks.$inferSelect;
export const insertPlagiarismCheckSchema = createInsertSchema(plagiarismChecks).omit({
  id: true,
  checkedAt: true,
  createdAt: true,
});
export type InsertPlagiarismCheck = z.infer<typeof insertPlagiarismCheckSchema>;

export type Feedback = typeof feedback.$inferSelect;
export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;

export type Bookmark = typeof bookmarks.$inferSelect;
export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;

export type Notification = typeof notifications.$inferSelect;
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export const insertNotificationPreferenceSchema = createInsertSchema(notificationPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertNotificationPreference = z.infer<typeof insertNotificationPreferenceSchema>;

export type LearningProgress = typeof learningProgress.$inferSelect;
export const insertLearningProgressSchema = createInsertSchema(learningProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertLearningProgress = z.infer<typeof insertLearningProgressSchema>;

// Article import batches table
export const importBatches = pgTable("import_batches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  blogId: varchar("blog_id").references(() => blogs.id),
  fileName: text("file_name").notNull(),
  totalCount: integer("total_count").notNull().default(0),
  importedCount: integer("imported_count").notNull().default(0),
  status: varchar("status").notNull().default("pending"), // pending, processing, completed, failed
  errorMessage: text("error_message"),
  parsedData: jsonb("parsed_data").default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  completedAt: timestamp("completed_at"),
});

// SEO metrics table
export const seoMetrics = pgTable("seo_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id),
  titleScore: integer("title_score").default(0), // 0-100
  contentScore: integer("content_score").default(0), // 0-100
  keywordScore: integer("keyword_score").default(0), // 0-100
  readabilityScore: integer("readability_score").default(0), // 0-100
  overallScore: integer("overall_score").default(0), // 0-100
  suggestedKeywords: text("suggested_keywords").array().default(sql`ARRAY[]::text[]`),
  suggestions: jsonb("suggestions").default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export type ImportBatch = typeof importBatches.$inferSelect;
export const insertImportBatchSchema = createInsertSchema(importBatches).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});
export type InsertImportBatch = z.infer<typeof insertImportBatchSchema>;

export type SeoMetric = typeof seoMetrics.$inferSelect;
export const insertSeoMetricSchema = createInsertSchema(seoMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSeoMetric = z.infer<typeof insertSeoMetricSchema>;

// User theme preferences with accent colors and auto-switch
export const themePreferences = pgTable("theme_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  accentColor: varchar("accent_color").default("blue"), // blue, purple, green, orange, red, pink
  darkMode: varchar("dark_mode").default("system"), // light, dark, system
  autoSwitchEnabled: boolean("auto_switch_enabled").default(false),
  autoSwitchTime: varchar("auto_switch_time"), // HH:MM format for switching
  customAccent: text("custom_accent"), // Custom hex color
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Content calendar for scheduling articles
export const contentCalendar = pgTable("content_calendar", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  articleId: varchar("article_id").references(() => articles.id),
  title: text("title").notNull(),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  status: varchar("status").notNull().default("planned"), // planned, writing, review, scheduled, published
  priority: varchar("priority").default("normal"), // low, normal, high
  category: varchar("category"),
  tags: text("tags").array(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tour progress for guided tour tracking
export const tourProgress = pgTable("tour_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  completedSteps: text("completed_steps").array().default(sql`ARRAY[]::text[]`),
  currentStep: varchar("current_step"),
  tourCompleted: boolean("tour_completed").default(false),
  tourStartedAt: timestamp("tour_started_at"),
  tourCompletedAt: timestamp("tour_completed_at"),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Collaborative editing sessions
export const editingSessions = pgTable("editing_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  articleId: varchar("article_id").notNull().references(() => articles.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  content: text("content"),
  cursorPosition: integer("cursor_position"),
  isActive: boolean("is_active").default(true),
  lastActivity: timestamp("last_activity").notNull().default(sql`now()`),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export type ThemePreference = typeof themePreferences.$inferSelect;
export const insertThemePreferenceSchema = createInsertSchema(themePreferences).omit({
  id: true,
  updatedAt: true,
});
export type InsertThemePreference = z.infer<typeof insertThemePreferenceSchema>;

export type ContentCalendarEvent = typeof contentCalendar.$inferSelect;
export const insertContentCalendarSchema = createInsertSchema(contentCalendar).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertContentCalendarEvent = z.infer<typeof insertContentCalendarSchema>;

export type TourProgress = typeof tourProgress.$inferSelect;
export const insertTourProgressSchema = createInsertSchema(tourProgress).omit({
  id: true,
  updatedAt: true,
});
export type InsertTourProgress = z.infer<typeof insertTourProgressSchema>;

export type EditingSession = typeof editingSessions.$inferSelect;
export const insertEditingSessionSchema = createInsertSchema(editingSessions).omit({
  id: true,
  createdAt: true,
});
export type InsertEditingSession = z.infer<typeof insertEditingSessionSchema>;
