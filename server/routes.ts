import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBlogSchema, insertArticleSchema, insertAnalyticsEventSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

      const existingUser = await storage.getUserByEmail(parsed.data.email);
      if (existingUser) return res.status(409).json({ error: "Email already exists" });

      const hashedPassword = await bcrypt.hash(parsed.data.password, 10);
      const user = await storage.createUser({
        ...parsed.data,
        password: hashedPassword,
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ user: { id: user.id, email: user.email, displayName: user.displayName }, token });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: "Email and password required" });

      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(401).json({ error: "Invalid credentials" });

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) return res.status(401).json({ error: "Invalid credentials" });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ user: { id: user.id, email: user.email, displayName: user.displayName }, token });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Middleware to verify JWT
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: "Invalid token" });
      req.userId = user.userId;
      next();
    });
  };

  // Blogs Routes
  app.get("/api/blogs/:id", async (req, res) => {
    try {
      const blog = await storage.getBlog(req.params.id);
      if (!blog) return res.status(404).json({ error: "Blog not found" });
      res.json(blog);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/user/blogs", authenticateToken, async (req: any, res) => {
    try {
      const blogs = await storage.getBlogsByUser(req.userId);
      res.json(blogs);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/blogs", authenticateToken, async (req: any, res) => {
    try {
      const parsed = insertBlogSchema.safeParse({ ...req.body, userId: req.userId });
      if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

      const blog = await storage.createBlog(parsed.data);
      res.status(201).json(blog);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.patch("/api/blogs/:id", authenticateToken, async (req: any, res) => {
    try {
      const blog = await storage.getBlog(req.params.id);
      if (!blog) return res.status(404).json({ error: "Blog not found" });
      if (blog.userId !== req.userId) return res.status(403).json({ error: "Unauthorized" });

      const updated = await storage.updateBlog(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/blogs/:id", authenticateToken, async (req: any, res) => {
    try {
      const blog = await storage.getBlog(req.params.id);
      if (!blog) return res.status(404).json({ error: "Blog not found" });
      if (blog.userId !== req.userId) return res.status(403).json({ error: "Unauthorized" });

      await storage.deleteBlog(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Articles Routes
  app.get("/api/articles/:id", async (req, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) return res.status(404).json({ error: "Article not found" });
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/blogs/:blogId/articles", async (req, res) => {
    try {
      const articles = await storage.getPublishedArticlesByBlog(req.params.blogId);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/blogs/:blogId/articles/admin", authenticateToken, async (req: any, res) => {
    try {
      const blog = await storage.getBlog(req.params.blogId);
      if (!blog) return res.status(404).json({ error: "Blog not found" });
      if (blog.userId !== req.userId) return res.status(403).json({ error: "Unauthorized" });

      const articles = await storage.getArticlesByBlog(req.params.blogId);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/articles", authenticateToken, async (req: any, res) => {
    try {
      const parsed = insertArticleSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

      const blog = await storage.getBlog(parsed.data.blogId);
      if (!blog) return res.status(404).json({ error: "Blog not found" });
      if (blog.userId !== req.userId) return res.status(403).json({ error: "Unauthorized" });

      const article = await storage.createArticle(parsed.data);
      res.status(201).json(article);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.patch("/api/articles/:id", authenticateToken, async (req: any, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) return res.status(404).json({ error: "Article not found" });

      const blog = await storage.getBlog(article.blogId);
      if (!blog || blog.userId !== req.userId) return res.status(403).json({ error: "Unauthorized" });

      const updated = await storage.updateArticle(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/articles/:id", authenticateToken, async (req: any, res) => {
    try {
      const article = await storage.getArticle(req.params.id);
      if (!article) return res.status(404).json({ error: "Article not found" });

      const blog = await storage.getBlog(article.blogId);
      if (!blog || blog.userId !== req.userId) return res.status(403).json({ error: "Unauthorized" });

      await storage.deleteArticle(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Analytics Routes
  app.post("/api/analytics/event", async (req, res) => {
    try {
      const parsed = insertAnalyticsEventSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

      const event = await storage.recordEvent(parsed.data);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/articles/:articleId/stats", async (req, res) => {
    try {
      const stats = await storage.getArticleStats(req.params.articleId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/blogs/:blogId/stats", authenticateToken, async (req: any, res) => {
    try {
      const blog = await storage.getBlog(req.params.blogId);
      if (!blog) return res.status(404).json({ error: "Blog not found" });
      if (blog.userId !== req.userId) return res.status(403).json({ error: "Unauthorized" });

      const stats = await storage.getBlogStats(req.params.blogId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // User Profile Routes
  app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      res.json({ id: user.id, email: user.email, displayName: user.displayName, bio: user.bio, avatar: user.avatar });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.patch("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const updates = {
        displayName: req.body.displayName,
        bio: req.body.bio,
        avatar: req.body.avatar,
      };

      const user = await storage.updateUser(req.userId, updates);
      if (!user) return res.status(404).json({ error: "User not found" });

      res.json({ id: user.id, email: user.email, displayName: user.displayName, bio: user.bio, avatar: user.avatar });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
