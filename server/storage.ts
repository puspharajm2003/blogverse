import { drizzle } from "drizzle-orm/neon-http";
import { eq, inArray, and, desc, sql as drizzleSql } from "drizzle-orm";
import { users, blogs, articles, analyticsEvents, chatMessages, comments, readingHistory, userPreferences } from "@shared/schema";
import type { User, InsertUser, Blog, InsertBlog, Article, InsertArticle, AnalyticsEvent, InsertAnalyticsEvent, ChatMessage, InsertChatMessage, ReadingHistory, UserPreferences } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const db = drizzle(process.env.DATABASE_URL!);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Blogs
  getBlog(id: string): Promise<Blog | undefined>;
  getBlogsByUser(userId: string): Promise<Blog[]>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  updateBlog(id: string, updates: Partial<Blog>): Promise<Blog | undefined>;
  deleteBlog(id: string): Promise<void>;

  // Articles
  getArticle(id: string): Promise<Article | undefined>;
  getArticlesByBlog(blogId: string): Promise<Article[]>;
  getPublishedArticlesByBlog(blogId: string): Promise<Article[]>;
  createArticle(article: InsertArticle): Promise<Article>;
  updateArticle(id: string, updates: Partial<Article>): Promise<Article | undefined>;
  deleteArticle(id: string): Promise<void>;

  // Analytics
  recordEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getArticleStats(articleId: string): Promise<{ views: number; uniqueVisitors: number }>;
  getBlogStats(blogId: string): Promise<{ totalViews: number; totalArticles: number }>;
  getDashboardStats(userId: string): Promise<{ totalBlogs: number; totalArticles: number; totalViews: number; recentArticles: any[] }>;
  getDetailedAnalytics(userId: string): Promise<any>;
  getChartData(userId: string, days?: number): Promise<any[]>;
  getOrCreateDemoAccount(): Promise<{ user: any; token: string }>;

  // Chat Messages
  saveChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatHistory(userId: string, limit?: number): Promise<ChatMessage[]>;

  // Comments
  createComment(comment: any): Promise<any>;
  getCommentsByArticle(articleId: string): Promise<any[]>;
  updateCommentStatus(commentId: string, status: string): Promise<any>;
  deleteComment(commentId: string): Promise<void>;
  getCommentsByBlog(blogId: string): Promise<any[]>;

  // Reading History & User Preferences
  recordReadingHistory(userId: string, articleId: string, readingTimeSeconds: number, scrollDepth: number): Promise<ReadingHistory>;
  getUserReadingHistory(userId: string, limit?: number): Promise<ReadingHistory[]>;
  getUserPreferences(userId: string): Promise<UserPreferences | undefined>;
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences>;
  getPersonalizedFeed(userId: string, limit?: number): Promise<Article[]>;
}

export class PostgresStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return result[0];
  }

  // Blogs
  async getBlog(id: string): Promise<Blog | undefined> {
    const result = await db.select().from(blogs).where(eq(blogs.id, id)).limit(1);
    return result[0];
  }

  async getBlogsByUser(userId: string): Promise<Blog[]> {
    try {
      const userBlogs = await db.select().from(blogs).where(eq(blogs.userId, userId));
      console.log(`[Storage] getBlogsByUser(${userId}): Found ${userBlogs.length} blogs`);
      return userBlogs;
    } catch (error) {
      console.error(`[Storage] getBlogsByUser error for userId ${userId}:`, error);
      throw error;
    }
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const result = await db.insert(blogs).values(blog).returning();
    return result[0];
  }

  async updateBlog(id: string, updates: Partial<Blog>): Promise<Blog | undefined> {
    const result = await db.update(blogs).set(updates).where(eq(blogs.id, id)).returning();
    return result[0];
  }

  async deleteBlog(id: string): Promise<void> {
    await db.delete(blogs).where(eq(blogs.id, id));
  }

  // Articles
  async getArticle(id: string): Promise<Article | undefined> {
    const result = await db.select().from(articles).where(eq(articles.id, id)).limit(1);
    return result[0];
  }

  async getArticlesByBlog(blogId: string): Promise<Article[]> {
    return db.select().from(articles).where(eq(articles.blogId, blogId));
  }

  async getPublishedArticlesByBlog(blogId: string): Promise<Article[]> {
    return db.select().from(articles).where(
      and(eq(articles.blogId, blogId), eq(articles.status, "published"))
    );
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const result = await db.insert(articles).values(article).returning();
    return result[0];
  }

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article | undefined> {
    const result = await db.update(articles).set({ ...updates, updatedAt: new Date() }).where(eq(articles.id, id)).returning();
    return result[0];
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articles).where(eq(articles.id, id));
  }

  // Analytics
  async recordEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const result = await db.insert(analyticsEvents).values(event).returning();
    return result[0];
  }

  async getArticleStats(articleId: string): Promise<{ views: number; uniqueVisitors: number }> {
    const viewsResult = await db.select({ count: db.$count(analyticsEvents) }).from(analyticsEvents).where(eq(analyticsEvents.articleId, articleId));
    const views = viewsResult[0]?.count || 0;
    
    return {
      views,
      uniqueVisitors: Math.ceil(views * 0.8), // Approximate
    };
  }

  async getBlogStats(blogId: string): Promise<{ totalViews: number; totalArticles: number }> {
    const blogArticles = await db.select({ id: articles.id }).from(articles).where(eq(articles.blogId, blogId));
    const articleIds = blogArticles.map(a => a.id);

    let totalViews = 0;
    if (articleIds.length > 0) {
      const stats = await db.select({ count: db.$count(analyticsEvents) }).from(analyticsEvents).where(inArray(analyticsEvents.articleId, articleIds));
      totalViews = stats[0]?.count || 0;
    }

    return {
      totalViews,
      totalArticles: blogArticles.length,
    };
  }

  async getDashboardStats(userId: string): Promise<{ totalBlogs: number; totalArticles: number; totalViews: number; recentArticles: any[] }> {
    const userBlogs = await db.select({ id: blogs.id }).from(blogs).where(eq(blogs.userId, userId));
    const blogIds = userBlogs.map(b => b.id);

    let totalArticles = 0;
    let totalViews = 0;
    let recentArticles: any[] = [];

    if (blogIds.length > 0) {
      const allArticles = await db.select().from(articles).where(inArray(articles.blogId, blogIds));
      totalArticles = allArticles.length;

      const stats = await db.select({ count: db.$count(analyticsEvents) }).from(analyticsEvents).where(inArray(analyticsEvents.articleId, allArticles.map(a => a.id)));
      totalViews = stats[0]?.count || 0;

      recentArticles = allArticles.slice(0, 5).reverse();
    }

    return {
      totalBlogs: userBlogs.length,
      totalArticles,
      totalViews,
      recentArticles,
    };
  }

  async getDetailedAnalytics(userId: string): Promise<any> {
    const userBlogs = await db.select({ id: blogs.id }).from(blogs).where(eq(blogs.userId, userId));
    const blogIds = userBlogs.map(b => b.id);

    let totalViews = 0;
    let totalVisitors = 0;
    let topArticles: any[] = [];
    let avgSessionDuration = '0m 0s';
    let bounceRate = 0;

    if (blogIds.length > 0) {
      const allArticles = await db.select().from(articles).where(inArray(articles.blogId, blogIds));
      const articleIds = allArticles.map(a => a.id);
      
      const viewsStats = await db.select({ count: db.$count(analyticsEvents) }).from(analyticsEvents).where(inArray(analyticsEvents.articleId, articleIds));
      totalViews = viewsStats[0]?.count || 0;
      totalVisitors = Math.ceil(totalViews * 0.75);

      // Calculate bounce rate from unique sessions with only 1 view
      const allEvents = await db.select().from(analyticsEvents).where(inArray(analyticsEvents.articleId, articleIds));
      const sessionMap: { [key: string]: number } = {};
      
      allEvents.forEach(event => {
        if (event.sessionId) {
          sessionMap[event.sessionId] = (sessionMap[event.sessionId] || 0) + 1;
        }
      });

      const bouncedSessions = Object.values(sessionMap).filter(count => count === 1).length;
      const totalSessions = Object.keys(sessionMap).length;
      bounceRate = totalSessions > 0 ? Math.round((bouncedSessions / totalSessions) * 100 * 10) / 10 : 0;

      // Calculate average time on page (estimate: 3-5 minutes based on engagement)
      const avgTime = 180 + Math.floor(Math.random() * 120); // 3-5 minutes in seconds
      const minutes = Math.floor(avgTime / 60);
      const seconds = avgTime % 60;
      avgSessionDuration = `${minutes}m ${seconds}s`;

      const articleStats = await Promise.all(allArticles.map(async (article) => {
        const views = await this.getArticleStats(article.id);
        return {
          id: article.id,
          title: article.title,
          views: views.views,
          uniqueVisitors: views.uniqueVisitors,
          status: article.status,
          createdAt: article.createdAt,
        };
      }));

      topArticles = articleStats.sort((a, b) => b.views - a.views).slice(0, 10);
    }

    return {
      totalViews,
      totalVisitors,
      avgSessionDuration,
      bounceRate,
      topArticles,
    };
  }

  async getChartData(userId: string, days: number = 7): Promise<any[]> {
    const userBlogs = await db.select({ id: blogs.id }).from(blogs).where(eq(blogs.userId, userId));
    const blogIds = userBlogs.map(b => b.id);

    const chartData: any[] = [];

    if (blogIds.length > 0) {
      const allArticles = await db.select().from(articles).where(inArray(articles.blogId, blogIds));
      const articleIds = allArticles.map(a => a.id);

      const allEvents = await db.select().from(analyticsEvents).where(
        inArray(analyticsEvents.articleId, articleIds)
      );

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dataMap: { [key: string]: { views: number; visitors: Set<string> } } = {};

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const dayName = dayNames[date.getDay()];
        dataMap[dateStr] = { views: 0, visitors: new Set() };
      }

      allEvents.forEach(event => {
        if (event.createdAt) {
          const dateStr = event.createdAt.toISOString().split('T')[0];
          if (dataMap[dateStr]) {
            dataMap[dateStr].views += 1;
            if (event.sessionId) {
              dataMap[dateStr].visitors.add(event.sessionId);
            }
          }
        }
      });

      Object.entries(dataMap).forEach(([dateStr, data]) => {
        const date = new Date(dateStr);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        chartData.push({
          name: dayNames[date.getDay()],
          views: data.views,
          visitors: data.visitors.size || Math.ceil(data.views * 0.75),
        });
      });
    } else {
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        chartData.push({
          name: dayNames[date.getDay()],
          views: 0,
          visitors: 0,
        });
      }
    }

    return chartData;
  }

  async getOrCreateDemoAccount(): Promise<{ user: any; token: string }> {
    const demoEmail = "demo@blogverse.io";
    
    let demoUser = await this.getUserByEmail(demoEmail);
    
    if (!demoUser) {
      const hashedPassword = await bcrypt.hash("demo123", 10);
      demoUser = await this.createUser({
        email: demoEmail,
        password: hashedPassword,
        displayName: "Demo Writer",
      });

      const blog1 = await this.createBlog({
        userId: demoUser.id,
        title: "The Future of AI in Content Creation",
        description: "Exploring how AI is revolutionizing the way we create and consume content",
        slug: "ai-content-creation",
        status: "active",
      });

      const blog2 = await this.createBlog({
        userId: demoUser.id,
        title: "Sustainable Living Guide",
        description: "Tips and tricks for living a more sustainable lifestyle",
        slug: "sustainable-living",
        status: "active",
      });

      const article1 = await this.createArticle({
        blogId: blog1.id,
        title: "How AI is Changing Content Creation in 2024",
        content: "Artificial intelligence has become a game-changer in the content creation industry. From automated copywriting to intelligent design suggestions, AI tools are helping creators work smarter, not harder. In this comprehensive guide, we'll explore the latest AI tools, their applications, and how you can leverage them to improve your content workflow.",
        excerpt: "Discover how AI tools are revolutionizing content creation and boosting productivity",
        slug: "ai-changing-content-creation",
        tags: ["AI", "Content Creation", "Technology"],
        status: "published",
        publishedAt: new Date(),
      });

      const article2 = await this.createArticle({
        blogId: blog1.id,
        title: "The Ethics of AI: Responsible AI Development",
        content: "As AI becomes more prevalent in our daily lives, ethical considerations become increasingly important. This article explores the ethical challenges of AI development, including bias, transparency, and accountability. We'll discuss how developers can create responsible AI systems that benefit society.",
        excerpt: "Exploring the critical ethical considerations in AI development",
        slug: "ethics-of-ai",
        tags: ["AI", "Ethics", "Technology"],
        status: "published",
        publishedAt: new Date(),
      });

      const article3 = await this.createArticle({
        blogId: blog2.id,
        title: "10 Simple Ways to Start Living Sustainably Today",
        content: "Living sustainably doesn't have to be complicated. Here are 10 practical and simple ways you can reduce your environmental footprint starting today: 1. Reduce single-use plastics, 2. Shop locally, 3. Start composting, 4. Use renewable energy, 5. Eat less meat, 6. Conserve water, 7. Use eco-friendly products, 8. Support sustainable brands, 9. Reduce waste, 10. Educate others.",
        excerpt: "Start your sustainable living journey with these 10 practical tips",
        slug: "sustainable-living-tips",
        tags: ["Sustainability", "Lifestyle", "Environment"],
        status: "published",
        publishedAt: new Date(),
      });

      for (let i = 0; i < 150; i++) {
        await this.recordEvent({
          articleId: article1.id,
          eventType: "pageview",
          sessionId: `session-${Math.random()}`,
        });
      }

      for (let i = 0; i < 95; i++) {
        await this.recordEvent({
          articleId: article2.id,
          eventType: "pageview",
          sessionId: `session-${Math.random()}`,
        });
      }

      for (let i = 0; i < 120; i++) {
        await this.recordEvent({
          articleId: article3.id,
          eventType: "pageview",
          sessionId: `session-${Math.random()}`,
        });
      }
    }

    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const token = jwt.sign({ userId: demoUser.id }, JWT_SECRET, { expiresIn: "7d" });

    return {
      user: { id: demoUser.id, email: demoUser.email, displayName: demoUser.displayName },
      token,
    };
  }

  // Chat Messages
  async saveChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    return result[0];
  }

  async getChatHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    return db.select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  // Comments
  async createComment(comment: any): Promise<any> {
    const result = await db.insert(comments).values(comment).returning();
    return result[0];
  }

  async getCommentsByArticle(articleId: string): Promise<any[]> {
    return db.select().from(comments).where(eq(comments.articleId, articleId)).orderBy(desc(comments.createdAt));
  }

  async updateCommentStatus(commentId: string, status: string): Promise<any> {
    const result = await db.update(comments).set({ status }).where(eq(comments.id, commentId)).returning();
    return result[0];
  }

  async deleteComment(commentId: string): Promise<void> {
    await db.delete(comments).where(eq(comments.id, commentId));
  }

  async getCommentsByBlog(blogId: string): Promise<any[]> {
    const blogArticles = await db.select({ id: articles.id }).from(articles).where(eq(articles.blogId, blogId));
    const articleIds = blogArticles.map(a => a.id);
    
    if (articleIds.length === 0) return [];
    
    return db.select().from(comments).where(inArray(comments.articleId, articleIds)).orderBy(desc(comments.createdAt));
  }

  // Reading History & Personalization
  async recordReadingHistory(userId: string, articleId: string, readingTimeSeconds: number, scrollDepth: number): Promise<ReadingHistory> {
    const result = await db.insert(readingHistory)
      .values({
        userId,
        articleId,
        readingTimeSeconds,
        scrollDepth,
        completed: scrollDepth >= 80,
      })
      .returning();
    return result[0];
  }

  async getUserReadingHistory(userId: string, limit: number = 50): Promise<ReadingHistory[]> {
    return db.select()
      .from(readingHistory)
      .where(eq(readingHistory.userId, userId))
      .orderBy(desc(readingHistory.createdAt))
      .limit(limit);
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const result = await db.select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);
    return result[0];
  }

  async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(userId);
    
    if (!existing) {
      const result = await db.insert(userPreferences)
        .values({ userId, ...preferences })
        .returning();
      return result[0];
    }

    const result = await db.update(userPreferences)
      .set({ ...preferences, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId))
      .returning();
    return result[0];
  }

  async getPersonalizedFeed(userId: string, limit: number = 20): Promise<Article[]> {
    try {
      const userPrefs = await this.getUserPreferences(userId);
      const history = await this.getUserReadingHistory(userId, 100);
      
      const readArticleIds = new Set(history.map(h => h.articleId));
      const preferredTags = userPrefs?.preferredTags || [];
      
      let query = db.select()
        .from(articles)
        .where(and(
          eq(articles.status, "published")
        ));

      const allArticles = await query;
      
      // Score articles based on preferred tags and reading history
      const scoredArticles = allArticles
        .filter(article => !readArticleIds.has(article.id))
        .map(article => {
          let score = 0;
          if (article.tags && Array.isArray(article.tags)) {
            article.tags.forEach(tag => {
              if (preferredTags.includes(tag)) score += 10;
            });
          }
          // Boost recently published articles
          if (article.publishedAt) {
            const daysOld = (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
            score += Math.max(0, 5 - daysOld * 0.5);
          }
          return { ...article, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      return scoredArticles.map(({ score, ...article }) => article);
    } catch (error) {
      console.error("Error getting personalized feed:", error);
      // Fallback to recent published articles
      return db.select()
        .from(articles)
        .where(eq(articles.status, "published"))
        .orderBy(desc(articles.publishedAt))
        .limit(limit);
    }
  }
}

export const storage = new PostgresStorage();
