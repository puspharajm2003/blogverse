import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBlogSchema, insertArticleSchema, insertAnalyticsEventSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Generate demo content for testing (fallback when API is unavailable)
function generateDemoContent(prompt: string, type: string): string {
  const demoResponses: { [key: string]: string } = {
    full: `# ${prompt}: A Complete Guide

## Introduction
${prompt} is becoming increasingly important in today's digital landscape. This comprehensive guide will help you understand the key aspects and best practices.

## Main Concepts
In this section, we'll explore the fundamental principles that make ${prompt} effective. Understanding these concepts is crucial for success in the modern world.

## Implementation Strategy
To get started, consider these practical approaches:
- Start with the basics and build your knowledge gradually
- Practice regularly to improve your skills
- Stay updated with latest trends and developments
- Learn from successful examples in the industry

## SEO Keywords
${prompt}, digital marketing, content creation, online presence, SEO optimization, industry trends, best practices

## Conclusion
By implementing these strategies and maintaining consistency, you can master ${prompt} and achieve your goals effectively.`,

    section: `${prompt} plays a vital role in modern digital strategies. By understanding its importance and implementing best practices, you can significantly improve your online presence. The key is to stay updated with trends and continuously refine your approach based on performance metrics and user feedback.`,

    outline: `<ul><li>Introduction and Overview<ul><li>Definition and Importance</li><li>Current Market Trends</li></ul></li><li>Core Concepts<ul><li>Basic Principles</li><li>Best Practices</li></ul></li><li>Implementation Guide<ul><li>Getting Started</li><li>Step-by-Step Process</li></ul></li><li>Advanced Techniques<ul><li>Optimization Strategies</li><li>Scaling Your Efforts</li></ul></li><li>Case Studies and Examples</li><li>Future Trends and Outlook</li></ul>`,

    title: `1. "Mastering ${prompt}: The Complete 2025 Guide"
2. "${prompt}: Proven Strategies for Success"
3. "The Ultimate Guide to ${prompt} in Digital Marketing"
4. "Why ${prompt} Matters: Insights and Best Practices"
5. "${prompt}: Expert Tips for Maximum Impact"`,

    tags: `${prompt}, digital marketing, content strategy, online growth, business optimization, industry insights, best practices, web presence, trend analysis, success strategies`,

    meta: `Learn everything about ${prompt} with our expert guide. Discover proven strategies, best practices, and actionable tips to transform your digital presence.`
  };

  return demoResponses[type] || demoResponses["section"];
}

// Call OpenRouter API directly using fetch
async function callOpenRouterAPI(messages: any[], maxTokens: number, type: string, prompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("OpenRouter API key not configured, using demo content");
    return generateDemoContent(prompt, type);
  }

  const requestBody = {
    model: "openai/gpt-3.5-turbo",
    messages,
    max_tokens: maxTokens,
    temperature: 0.7,
  };

  try {
    const response = await fetch("https://openrouter.io/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://blogverse.io",
        "X-Title": "BlogVerse",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      console.warn(`OpenRouter API returned ${response.status}, using demo content`);
      return generateDemoContent(prompt, type);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || generateDemoContent(prompt, type);
  } catch (error) {
    console.warn("OpenRouter API call failed, using demo content:", error);
    return generateDemoContent(prompt, type);
  }
}

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
      console.error("Signup error:", error);
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
      console.error("Login error:", error);
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

  // Dashboard Stats Route
  app.get("/api/dashboard/stats", authenticateToken, async (req: any, res) => {
    try {
      const stats = await storage.getDashboardStats(req.userId);
      res.json(stats);
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Detailed Analytics Route
  app.get("/api/analytics/detailed", authenticateToken, async (req: any, res) => {
    try {
      const analytics = await storage.getDetailedAnalytics(req.userId);
      res.json(analytics);
    } catch (error) {
      console.error("Analytics error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Chart Data Route
  app.get("/api/analytics/chart", authenticateToken, async (req: any, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days) : 7;
      const chartData = await storage.getChartData(req.userId, days);
      res.json(chartData);
    } catch (error) {
      console.error("Chart data error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // Demo Account Route
  app.post("/api/auth/demo", async (req, res) => {
    try {
      const demoAccount = await storage.getOrCreateDemoAccount();
      res.json(demoAccount);
    } catch (error) {
      console.error("Demo account error:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  // AI Content Generation Route
  app.post("/api/ai/generate", authenticateToken, async (req: any, res) => {
    try {
      const { prompt, type } = req.body;
      
      if (!prompt || !type) {
        return res.status(400).json({ error: "Prompt and type are required" });
      }

      let systemPrompt = "";
      let userPrompt = prompt;
      let maxTokens = 500;

      switch (type) {
        case "full":
          systemPrompt = "You are a professional SEO-optimized blog writer. Create a complete blog post with:\n1. A catchy, SEO-friendly title\n2. 3-4 main body paragraphs with valuable content\n3. 5-7 relevant SEO keywords throughout\n4. Proper heading structure (H2, H3)\nMake it engaging, informative, and ready to publish.";
          userPrompt = `Write a complete blog article about: ${prompt}\n\nInclude:\n- Title\n- Body content (3-4 paragraphs)\n- SEO Keywords (5-7 keywords)\n\nFormat the response clearly with these sections.`;
          maxTokens = 2000;
          break;
        case "section":
          systemPrompt = "You are a blog content writer. Write a well-crafted, engaging section or paragraph that flows naturally.";
          userPrompt = `Write a detailed section for a blog post about: ${prompt}`;
          maxTokens = 500;
          break;
        case "outline":
          systemPrompt = "You are a content strategist. Create a detailed outline with main sections and subsections.";
          userPrompt = `Create a detailed outline for a blog post about: ${prompt}`;
          maxTokens = 1500;
          break;
        case "title":
          systemPrompt = "You are a copywriter specializing in blog titles. Generate 3-5 catchy, SEO-friendly blog titles that attract readers.";
          userPrompt = `Generate compelling blog titles for: ${prompt}`;
          maxTokens = 300;
          break;
        case "tags":
          systemPrompt = "You are a content tagging expert. Generate relevant tags for blog posts. Return as comma-separated values.";
          userPrompt = `Generate 8-10 relevant tags for a blog post about: ${prompt}`;
          maxTokens = 200;
          break;
        case "meta":
          systemPrompt = "You are an SEO expert. Write a compelling meta description (max 160 characters) that encourages clicks from search results.";
          userPrompt = `Write an SEO meta description for: ${prompt}`;
          maxTokens = 150;
          break;
        default:
          return res.status(400).json({ error: "Invalid generation type" });
      }

      try {
        const generatedText = await callOpenRouterAPI(
          [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          maxTokens,
          type,
          prompt
        );

        res.json({
          text: generatedText,
          type: type,
          timestamp: new Date(),
          demo: !process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === "",
        });
      } catch (openrouterError: any) {
        console.error("AI generation error:", openrouterError.message);
        
        // Fallback to demo content on error
        const demoText = generateDemoContent(prompt, type);
        res.json({
          text: demoText,
          type: type,
          timestamp: new Date(),
          demo: true,
        });
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate content",
        details: error?.message || "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
