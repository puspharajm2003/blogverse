import { drizzle } from "drizzle-orm/neon-http";
import { sql } from "drizzle-orm";
import { users, blogs, articles, analyticsEvents } from "@shared/schema";
import type { User, InsertUser, Blog, InsertBlog, Article, InsertArticle, AnalyticsEvent, InsertAnalyticsEvent } from "@shared/schema";

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
}

export class PostgresStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(sql`${users.id} = ${id}`).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(sql`${users.email} = ${email}`).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await db.update(users).set(updates).where(sql`${users.id} = ${id}`).returning();
    return result[0];
  }

  // Blogs
  async getBlog(id: string): Promise<Blog | undefined> {
    const result = await db.select().from(blogs).where(sql`${blogs.id} = ${id}`).limit(1);
    return result[0];
  }

  async getBlogsByUser(userId: string): Promise<Blog[]> {
    return db.select().from(blogs).where(sql`${blogs.userId} = ${userId}`);
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const result = await db.insert(blogs).values(blog).returning();
    return result[0];
  }

  async updateBlog(id: string, updates: Partial<Blog>): Promise<Blog | undefined> {
    const result = await db.update(blogs).set(updates).where(sql`${blogs.id} = ${id}`).returning();
    return result[0];
  }

  async deleteBlog(id: string): Promise<void> {
    await db.delete(blogs).where(sql`${blogs.id} = ${id}`);
  }

  // Articles
  async getArticle(id: string): Promise<Article | undefined> {
    const result = await db.select().from(articles).where(sql`${articles.id} = ${id}`).limit(1);
    return result[0];
  }

  async getArticlesByBlog(blogId: string): Promise<Article[]> {
    return db.select().from(articles).where(sql`${articles.blogId} = ${blogId}`);
  }

  async getPublishedArticlesByBlog(blogId: string): Promise<Article[]> {
    return db.select().from(articles).where(sql`${articles.blogId} = ${blogId} AND ${articles.status} = 'published'`);
  }

  async createArticle(article: InsertArticle): Promise<Article> {
    const result = await db.insert(articles).values(article).returning();
    return result[0];
  }

  async updateArticle(id: string, updates: Partial<Article>): Promise<Article | undefined> {
    const result = await db.update(articles).set({ ...updates, updatedAt: new Date() }).where(sql`${articles.id} = ${id}`).returning();
    return result[0];
  }

  async deleteArticle(id: string): Promise<void> {
    await db.delete(articles).where(sql`${articles.id} = ${id}`);
  }

  // Analytics
  async recordEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const result = await db.insert(analyticsEvents).values(event).returning();
    return result[0];
  }

  async getArticleStats(articleId: string): Promise<{ views: number; uniqueVisitors: number }> {
    const result = await db.select({
      views: sql<number>`count(*)`,
      uniqueVisitors: sql<number>`count(distinct session_id)`,
    }).from(analyticsEvents).where(sql`${analyticsEvents.articleId} = ${articleId}`);
    
    return {
      views: result[0]?.views || 0,
      uniqueVisitors: result[0]?.uniqueVisitors || 0,
    };
  }

  async getBlogStats(blogId: string): Promise<{ totalViews: number; totalArticles: number }> {
    const blogArticles = await db.select({ id: articles.id }).from(articles).where(sql`${articles.blogId} = ${blogId}`);
    const articleIds = blogArticles.map(a => a.id);

    let totalViews = 0;
    if (articleIds.length > 0) {
      const stats = await db.select({ count: sql<number>`count(*)` }).from(analyticsEvents).where(sql`${analyticsEvents.articleId} in (${sql.join(articleIds)})`);
      totalViews = stats[0]?.count || 0;
    }

    return {
      totalViews,
      totalArticles: blogArticles.length,
    };
  }
}

export const storage = new PostgresStorage();
