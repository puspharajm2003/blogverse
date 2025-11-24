import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertBlogSchema, insertArticleSchema, insertAnalyticsEventSchema, insertChatMessageSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Generate professional prompts based on generation type
function getProessionalPrompt(topic: string, type: string): { system: string; user: string } {
  const prompts: { [key: string]: { system: string; user: string } } = {
    full: {
      system: "You are a professional Content Creator and Blog Script Writer with expertise in SEO optimization. Your task is to create high-quality, engaging blog content that ranks well in search engines.",
      user: `Act as a Content Creator and Blog Script Writer. Generate a comprehensive blog post about "${topic}" with the following requirements:
- Minimum 800-1000 words
- Include SEO-friendly keywords throughout (highlight 5-7 main keywords)
- Use proper H2 and H3 heading structure
- Add an engaging introduction and conclusion
- Include practical insights and actionable tips
- Format with clear sections and bullet points where appropriate
- Ensure content is original, professional, and ready to publish

Please provide the complete blog post with all sections clearly marked.`
    },
    section: {
      system: "You are a professional content writer specializing in blog content creation with strong SEO knowledge.",
      user: `Act as a Content Creator and Blog Script Writer. Write a detailed and engaging section/paragraph for a blog post about "${topic}" with:
- 300-500 words
- Naturally incorporate relevant SEO keywords
- Professional tone with engaging language
- Clear structure with supporting details
- Practical insights and examples

Ensure the section flows naturally and can be easily integrated into a larger article.`
    },
    outline: {
      system: "You are a strategic content planner and blog outline specialist with deep SEO knowledge.",
      user: `Create a comprehensive, SEO-optimized outline for a blog post about "${topic}" with:
- Main sections and subsections
- Target keywords for each section
- Brief description of content for each section
- Suggested word count for sections
- Key points to cover
- Call-to-action section

Format as a clear, hierarchical outline that a writer can easily follow.`
    },
    title: {
      system: "You are an expert copywriter specializing in creating catchy, SEO-friendly blog titles that drive clicks.",
      user: `Generate 5 highly compelling and SEO-friendly blog title options for an article about "${topic}". Each title should:
- Be attention-grabbing and click-worthy
- Include relevant keywords naturally
- Be between 50-60 characters
- Appeal to the target audience
- Follow proven title formulas (how-to, number-based, curiosity-driven, etc.)

Provide titles with brief explanations of why each works well.`
    },
    tags: {
      system: "You are an SEO expert specializing in content tagging and categorization.",
      user: `Generate 8-10 relevant, searchable tags/keywords for a blog post about "${topic}". 
- Include long-tail keywords
- Mix broad and specific terms
- Use industry-relevant terminology
- Consider search volume and relevance

Return as comma-separated values, ordered by relevance.`
    },
    meta: {
      system: "You are an SEO specialist expert at writing compelling meta descriptions that improve click-through rates.",
      user: `Write a compelling SEO meta description for a blog post about "${topic}" with:
- Maximum 160 characters
- Include the main keyword naturally
- Be compelling and encourage clicks
- Clearly convey the article's value
- Use active voice

Provide the meta description ready to use.`
    }
  };

  return prompts[type] || prompts["section"];
}

// Generate demo content for testing (fallback when API is unavailable)
function generateDemoContent(prompt: string, type: string): string {
  const demoResponses: { [key: string]: string } = {
    full: `# <strong>${prompt}</strong>: Your Ultimate Professional Guide to Success

## Introduction: Understanding the Importance

<strong>${prompt}</strong> has emerged as one of the most critical factors in today's rapidly evolving digital landscape. Whether you're a seasoned professional or just beginning your journey, understanding the nuances of ${prompt} is essential for achieving meaningful results. This comprehensive guide will walk you through everything you need to know, from fundamental concepts to advanced strategies, ensuring you have the knowledge and tools required to excel.

## What is <strong>${prompt}</strong>? Breaking Down the Basics

Before diving deeper, let's establish a solid foundation. <strong>${prompt}</strong> encompasses a wide range of practices, tools, and methodologies designed to address modern challenges. In today's competitive environment, organizations and individuals who master ${prompt} gain significant advantages over their competitors. The field has evolved dramatically over the past few years, with new innovations and best practices emerging regularly.

### Key Components and Definitions

<strong>Understanding the core elements</strong> is crucial for anyone looking to leverage ${prompt} effectively. The foundational elements include strategic planning, implementation frameworks, measurement systems, and continuous optimization. Each of these components plays a vital role in ensuring success. By grasping these fundamentals, you'll be better equipped to make informed decisions and achieve your objectives.

## Core Principles and Best Practices

### <strong>1. Strategic Planning and Research</strong>

The first step in any successful ${prompt} initiative is comprehensive planning. This involves conducting thorough research, identifying your target audience, analyzing competitor approaches, and setting clear, measurable goals. Strategic planning provides the roadmap for all subsequent actions and ensures that your efforts are aligned with your broader business objectives. Invest time in this phase—it often determines whether your initiative will succeed or struggle.

### <strong>2. Implementation Excellence</strong>

Once your strategy is in place, implementation becomes critical. This phase requires attention to detail, proper resource allocation, and team coordination. Success depends on executing your plan consistently and making adjustments as needed based on real-world feedback. Many organizations find that breaking their implementation into phases helps manage complexity and allows for course corrections along the way.

### <strong>3. Measurement and Analytics</strong>

<strong>Data-driven decision making</strong> is non-negotiable in modern ${prompt}. Establish key performance indicators (KPIs) that align with your goals, and regularly monitor these metrics. This allows you to understand what's working, identify areas for improvement, and demonstrate ROI to stakeholders. Tools for tracking and analysis have become increasingly sophisticated, making it easier than ever to gain actionable insights.

## Advanced Strategies for Maximum Impact

### <strong>Optimization Techniques</strong>

To truly excel at ${prompt}, you need to go beyond basic implementation. Advanced optimization involves:

- Continuous A/B testing to identify the most effective approaches
- Personalization strategies tailored to different audience segments
- Automation to improve efficiency and consistency
- Integration of emerging technologies and innovations
- Regular competitive analysis to stay ahead of industry trends

These sophisticated techniques separate industry leaders from average performers. By implementing them strategically, you can achieve results that significantly outperform baseline expectations.

### <strong>Leveraging Technology and Tools</strong>

The technology landscape offers unprecedented opportunities to enhance your ${prompt} efforts. Modern platforms provide automation, analytics, collaboration features, and integration capabilities that were unimaginable just a few years ago. Selecting the right tools for your specific needs can dramatically improve efficiency and outcomes. However, remember that tools are enablers—success ultimately depends on strategy and execution.

## Common Challenges and How to Overcome Them

Most professionals encounter obstacles when implementing ${prompt}. Understanding these challenges and having strategies to address them increases your likelihood of success:

<strong>Challenge 1: Resource Constraints</strong> - Many organizations struggle with limited budgets or personnel. Solution: Prioritize high-impact activities and consider outsourcing specialized tasks.

<strong>Challenge 2: Rapid Market Changes</strong> - Staying current with industry evolution is demanding. Solution: Implement continuous learning processes and stay connected with industry communities.

<strong>Challenge 3: Team Alignment</strong> - Getting everyone on the same page is often difficult. Solution: Establish clear communication channels and regular synchronization meetings.

<strong>Challenge 4: Measuring Success</strong> - Determining what to measure and how to evaluate results can be complex. Solution: Start with basic KPIs and expand over time as your understanding improves.

## Real-World Applications and Case Studies

<strong>Learning from others' experiences</strong> provides invaluable insights. Successful ${prompt} implementations share common characteristics: clear goals, adequate resources, skilled teams, and commitment to continuous improvement. Whether in startups or enterprise environments, the principles remain consistent. Organizations that excel typically invest in training, stay adaptable, and maintain focus on long-term value creation rather than short-term gains.

## Future Trends and Evolution

The field of ${prompt} continues to evolve rapidly. Emerging trends to watch include increased automation, artificial intelligence integration, enhanced personalization capabilities, and greater emphasis on sustainability and ethical practices. Staying informed about these trends ensures you're not blindsided by industry shifts and can position yourself advantageously for future opportunities.

## Actionable Recommendations for Success

To maximize your success with ${prompt}, consider implementing these recommendations:

1. <strong>Start with assessment</strong> - Evaluate your current state and identify gaps
2. <strong>Set specific goals</strong> - Define clear, measurable objectives
3. <strong>Develop a timeline</strong> - Create a realistic implementation schedule
4. <strong>Build your team</strong> - Assemble people with necessary skills and experience
5. <strong>Invest in tools</strong> - Select technology that supports your strategy
6. <strong>Monitor and adjust</strong> - Regular measurement and optimization are essential
7. <strong>Share knowledge</strong> - Document and communicate learnings across your organization
8. <strong>Stay updated</strong> - Dedicate resources to continuous learning and development

## Conclusion: Your Path Forward

Mastering ${prompt} is not a one-time achievement but an ongoing journey of learning, adaptation, and improvement. By understanding the fundamental concepts, implementing proven strategies, learning from challenges, and staying informed about industry trends, you position yourself for long-term success. The competitive advantages gained through excellence in ${prompt} often translate to significant business impact and personal professional growth.

The time to act is now. Whether you're just beginning or looking to enhance existing efforts, the frameworks and strategies outlined in this guide provide a solid foundation. Remember that success requires commitment, but the rewards—in terms of efficiency, results, and satisfaction—make the effort worthwhile. Take action today, measure your progress, and continuously refine your approach. Your mastery of ${prompt} awaits.

---

<strong>Key Takeaways:</strong>
- Strategic planning and research are foundational to success
- Implementation excellence separates leaders from followers
- Data-driven decisions maximize outcomes
- Continuous optimization is essential in today's environment
- Staying adaptable and learning from experience accelerates growth

<strong>SEO Keywords & Topics:</strong> ${prompt}, professional strategy, implementation guide, best practices, optimization techniques, digital success, industry insights, business growth, advanced strategies, competitive advantage`,

    section: `## <strong>Understanding ${prompt} in Modern Context</strong>

${prompt} has become integral to achieving success in today's dynamic environment. This critical practice encompasses multiple dimensions, each contributing to overall effectiveness and sustainability.

<strong>Why This Matters</strong>
Organizations and professionals who master ${prompt} consistently outperform their peers. The competitive advantage gained through strategic implementation translates directly to measurable business outcomes. Whether you're working in a corporate environment or managing your own ventures, understanding and applying these principles is essential.

<strong>Core Principles</strong>
The foundation of effective ${prompt} rests on several key principles:
- **Strategic alignment** with long-term objectives
- **Data-driven decision making** based on accurate metrics
- **Continuous improvement** through regular optimization
- **Team collaboration** and clear communication
- **Adaptability** to changing market conditions

By understanding these principles deeply and applying them consistently, you can significantly improve your results. The key is to stay updated with industry trends and continuously refine your approach based on what works in your specific context.

<strong>Practical Implementation</strong>
Implementation doesn't need to be complex. Start by assessing your current state, setting specific goals, and identifying the high-impact actions that will move the needle. Focus on consistency and measurement—these two factors often determine success or failure more than any other variable.`,

    outline: `# Content Outline: ${prompt}

## I. Introduction & Context
### A. Defining ${prompt}
   - Historical evolution and development
   - Current relevance in 2025
   - Industry statistics and growth trends

### B. Why It Matters
   - Competitive advantages gained
   - Business impact and ROI
   - Personal and professional growth opportunities

## II. Foundational Concepts
### A. Core Principles
   - Strategic planning framework
   - Implementation methodology
   - Measurement systems

### B. Best Practices
   - Industry-proven approaches
   - Common success factors
   - Lessons from leading organizations

## III. Detailed Implementation Guide
### A. Phase 1: Planning and Assessment
   - Current state analysis
   - Goal setting and objective definition
   - Resource allocation

### B. Phase 2: Execution
   - Step-by-step implementation process
   - Team coordination and management
   - Quality assurance and monitoring

### C. Phase 3: Optimization
   - Performance analysis
   - Data-driven improvements
   - Scaling strategies

## IV. Advanced Strategies
### A. Emerging Techniques
   - AI and automation integration
   - Personalization approaches
   - Advanced analytics

### B. Competitive Advantages
   - Differentiation strategies
   - Market positioning
   - Innovation opportunities

## V. Real-World Applications
### A. Case Studies
   - Successful implementations
   - Lessons learned
   - Industry examples

### B. Common Challenges
   - Obstacles and solutions
   - Risk mitigation strategies
   - Contingency planning

## VI. Future Outlook
### A. Emerging Trends
   - Industry evolution forecast
   - Technology impacts
   - Skill requirements

### B. Actionable Next Steps
   - Immediate actions
   - Long-term strategy
   - Continuous learning resources`,

    title: `1. "<strong>Mastering ${prompt}</strong>: The Professional's Complete 2025 Guide"
2. "<strong>${prompt} Strategies</strong> That Deliver Measurable Results"
3. "The Ultimate ${prompt} Playbook: From Basics to Advanced Tactics"
4. "Why Industry Leaders Prioritize ${prompt} (And Why You Should Too)"
5. "<strong>${prompt} Secrets</strong>: Proven Techniques for Maximum Impact"`,

    tags: `${prompt}, professional strategy, business optimization, industry best practices, digital success, content strategy, implementation guide, business growth, competitive advantage, 2025 trends, strategic planning, performance optimization, professional development, industry insights, success methodology`,

    meta: `Master <strong>${prompt}</strong> with our comprehensive expert guide. Discover proven strategies, best practices, and actionable techniques to achieve professional success and drive measurable business results.`
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
      
      // Mark admin email with special privileges
      const isAdminEmail = parsed.data.email === "puspharaj.m2003@gmail.com";
      
      const user = await storage.createUser({
        ...parsed.data,
        password: hashedPassword,
        isAdmin: isAdminEmail,
        plan: isAdminEmail ? "enterprise" : "free",
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
      res.status(201).json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          displayName: user.displayName,
          plan: user.plan,
          isAdmin: user.isAdmin 
        }, 
        token 
      });
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
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          displayName: user.displayName,
          plan: user.plan,
          isAdmin: user.isAdmin,
          avatar: user.avatar,
          bio: user.bio
        }, 
        token 
      });
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
      const userId = req.userId;
      console.log(`[DEBUG] Fetching blogs for userId: ${userId}`);
      const blogs = await storage.getBlogsByUser(userId);
      console.log(`[DEBUG] Found ${blogs.length} blogs for userId: ${userId}`, blogs.map(b => ({ id: b.id, title: b.title })));
      res.json(blogs);
    } catch (error) {
      console.error("[DEBUG] Error fetching blogs:", error);
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
      res.json({ 
        id: user.id, 
        email: user.email, 
        displayName: user.displayName, 
        plan: user.plan,
        isAdmin: user.isAdmin,
        bio: user.bio, 
        avatar: user.avatar 
      });
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

      res.json({ 
        id: user.id, 
        email: user.email, 
        displayName: user.displayName, 
        plan: user.plan,
        isAdmin: user.isAdmin,
        bio: user.bio, 
        avatar: user.avatar 
      });
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

  // Chat Message Routes
  app.post("/api/chat/message", authenticateToken, async (req: any, res) => {
    try {
      const { role, message, generationType, topic } = req.body;
      
      if (!role || !message) {
        return res.status(400).json({ error: "Role and message are required" });
      }

      const chatMessage = await storage.saveChatMessage({
        userId: req.userId,
        role,
        message,
        generationType: generationType || null,
        topic: topic || null,
      });

      res.json(chatMessage);
    } catch (error) {
      console.error("Chat message error:", error);
      res.status(500).json({ error: "Failed to save chat message" });
    }
  });

  app.get("/api/chat/history", authenticateToken, async (req: any, res) => {
    try {
      const limit = parseInt((req.query.limit as string) || "50", 10);
      const chatHistory = await storage.getChatHistory(req.userId, limit);
      
      // Return in chronological order (oldest first)
      res.json(chatHistory.reverse());
    } catch (error) {
      console.error("Chat history error:", error);
      res.status(500).json({ error: "Failed to fetch chat history" });
    }
  });

  // Comment Routes
  app.post("/api/comments", async (req, res) => {
    try {
      const { articleId, authorName, authorEmail, content } = req.body;
      
      if (!articleId || !authorName || !authorEmail || !content) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const comment = await storage.createComment({
        articleId,
        authorName,
        authorEmail,
        content,
        status: "pending",
      });

      res.json(comment);
    } catch (error) {
      console.error("Comment creation error:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  app.get("/api/comments/article/:articleId", async (req, res) => {
    try {
      const { articleId } = req.params;
      const comments = await storage.getCommentsByArticle(articleId);
      res.json(comments);
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.get("/api/comments/blog/:blogId", authenticateToken, async (req: any, res) => {
    try {
      const { blogId } = req.params;
      const comments = await storage.getCommentsByBlog(blogId);
      res.json(comments);
    } catch (error) {
      console.error("Get blog comments error:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.patch("/api/comments/:commentId", authenticateToken, async (req: any, res) => {
    try {
      const { commentId } = req.params;
      const { status } = req.body;
      
      if (!status || !["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const comment = await storage.updateCommentStatus(commentId, status);
      res.json(comment);
    } catch (error) {
      console.error("Update comment error:", error);
      res.status(500).json({ error: "Failed to update comment" });
    }
  });

  app.delete("/api/comments/:commentId", authenticateToken, async (req: any, res) => {
    try {
      const { commentId } = req.params;
      await storage.deleteComment(commentId);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({ error: "Failed to delete comment" });
    }
  });

  // AI Content Generation Route
  app.post("/api/ai/generate", authenticateToken, async (req: any, res) => {
    try {
      const { prompt, type } = req.body;
      
      if (!prompt || !type) {
        return res.status(400).json({ error: "Prompt and type are required" });
      }

      let maxTokens = 500;
      const promptData = getProessionalPrompt(prompt, type);
      const systemPrompt = promptData.system;
      const userPrompt = promptData.user;

      if (type === "full") maxTokens = 2000;
      else if (type === "outline") maxTokens = 1500;
      else if (type === "title") maxTokens = 300;
      else if (type === "tags") maxTokens = 200;
      else if (type === "meta") maxTokens = 150;
      else if (!["section", "full", "outline", "title", "tags", "meta"].includes(type)) {
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

  // Content Brainstorm Route
  app.post("/api/ai/brainstorm", authenticateToken, async (req: any, res) => {
    try {
      const { niche } = req.body;
      
      if (!niche) {
        return res.status(400).json({ error: "Niche is required" });
      }

      // Return demo ideas directly (AI API might not be needed for simple ideas)
      const ideas = generateDemoBrainstormIdeas(niche);

      res.json({
        ideas: ideas,
        niche: niche,
        timestamp: new Date(),
      });
    } catch (error: any) {
      console.error("Brainstorm error:", error);
      res.status(500).json({ 
        error: "Failed to generate brainstorm ideas",
        details: error?.message || "Unknown error"
      });
    }
  });

  // User Preferences
  app.get("/api/user/preferences", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      
      const prefs = await storage.getUserPreferences(user.id);
      res.json(prefs || { userId: user.id, preferredTags: [], readingLevel: "intermediate" });
    } catch (error) {
      res.status(500).json({ error: "Failed to get preferences" });
    }
  });

  app.patch("/api/user/preferences", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      
      const prefs = await storage.updateUserPreferences(user.id, req.body);
      res.json(prefs);
    } catch (error) {
      res.status(500).json({ error: "Failed to update preferences" });
    }
  });

  // Reading History
  app.post("/api/reading-history", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      
      const { articleId, readingTimeSeconds, scrollDepth } = req.body;
      const history = await storage.recordReadingHistory(user.id, articleId, readingTimeSeconds, scrollDepth);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to record reading history" });
    }
  });

  // Personalized Feed
  app.get("/api/feed/personalized", async (req, res) => {
    try {
      const user = (req as any).user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      
      const limit = parseInt(req.query.limit as string) || 20;
      const feed = await storage.getPersonalizedFeed(user.id, limit);
      res.json(feed);
    } catch (error) {
      res.status(500).json({ error: "Failed to get personalized feed" });
    }
  });

  // Initialize achievements on startup
  app.get("/api/achievements/init", async (req, res) => {
    try {
      await storage.initializeDefaultAchievements();
      res.json({ message: "Achievements initialized" });
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize achievements" });
    }
  });

  // Get all achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const all = await storage.getAllAchievements();
      res.json(all);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  // Get user achievements
  app.get("/api/achievements/user", authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      
      const userAchievements = await storage.getUserAchievements(user.id);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user achievements" });
    }
  });

  // Check and unlock achievements
  app.post("/api/achievements/check", authenticateToken, async (req: any, res) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: "Unauthorized" });
      
      const unlockedIds = await storage.checkAndUnlockAchievements(user.id);
      res.json({ unlockedIds, count: unlockedIds.length });
    } catch (error) {
      res.status(500).json({ error: "Failed to check achievements" });
    }
  });

  // Plagiarism Checker Endpoints
  app.post("/api/plagiarism/check", authenticateToken, async (req: any, res) => {
    try {
      const { articleId, content } = req.body;
      
      if (!articleId || !content) {
        return res.status(400).json({ error: "Missing articleId or content" });
      }

      const article = await storage.getArticle(articleId);
      if (!article) return res.status(404).json({ error: "Article not found" });

      const blog = await storage.getBlog(article.blogId);
      if (!blog || blog.userId !== req.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const result = await storage.checkArticlePlagiarism(articleId, req.userId, content);
      
      res.json({
        ...result,
        matches: typeof result.matches === 'string' ? JSON.parse(result.matches) : result.matches
      });
    } catch (error) {
      console.error("Plagiarism check error:", error);
      res.status(500).json({ error: "Failed to check plagiarism" });
    }
  });

  app.get("/api/plagiarism/:articleId", authenticateToken, async (req: any, res) => {
    try {
      const { articleId } = req.params;
      
      const article = await storage.getArticle(articleId);
      if (!article) return res.status(404).json({ error: "Article not found" });

      const blog = await storage.getBlog(article.blogId);
      if (!blog || blog.userId !== req.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const checks = await storage.getPlagiarismChecksByArticle(articleId);
      const formattedChecks = checks.map(check => ({
        ...check,
        matches: typeof check.matches === 'string' ? JSON.parse(check.matches) : check.matches
      }));

      res.json(formattedChecks);
    } catch (error) {
      console.error("Get plagiarism history error:", error);
      res.status(500).json({ error: "Failed to fetch plagiarism history" });
    }
  });

  app.get("/api/plagiarism/:articleId/latest", authenticateToken, async (req: any, res) => {
    try {
      const { articleId } = req.params;
      
      const article = await storage.getArticle(articleId);
      if (!article) return res.status(404).json({ error: "Article not found" });

      const blog = await storage.getBlog(article.blogId);
      if (!blog || blog.userId !== req.userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const check = await storage.getLatestPlagiarismCheck(articleId);
      
      if (!check) {
        return res.json(null);
      }

      res.json({
        ...check,
        matches: typeof check.matches === 'string' ? JSON.parse(check.matches) : check.matches
      });
    } catch (error) {
      console.error("Get latest plagiarism check error:", error);
      res.status(500).json({ error: "Failed to fetch latest plagiarism check" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Generate demo brainstorm ideas
function generateDemoBrainstormIdeas(niche: string): any[] {
  return [
    {
      id: "1",
      title: `Beginner's Guide to ${niche}`,
      description: `A comprehensive introduction to ${niche} for newcomers, covering fundamental concepts and getting started tips.`,
      category: "Guide",
      keywords: ["beginner", "guide", "tutorial", niche.toLowerCase()],
    },
    {
      id: "2",
      title: `10 Essential Tips for ${niche} Success`,
      description: `Learn the top 10 actionable tips that professionals use to excel in ${niche}.`,
      category: "Tips & Tricks",
      keywords: ["tips", "best practices", "strategies", niche.toLowerCase()],
    },
    {
      id: "3",
      title: `The Future of ${niche}: Trends to Watch`,
      description: `Explore emerging trends and innovations shaping the future of ${niche} industry.`,
      category: "Trends",
      keywords: ["trends", "future", "innovation", "industry", niche.toLowerCase()],
    },
    {
      id: "4",
      title: `${niche} vs Competitors: A Comprehensive Comparison`,
      description: `Compare different approaches and tools within the ${niche} space to help readers make informed decisions.`,
      category: "Comparison",
      keywords: ["comparison", "alternatives", "tools", niche.toLowerCase()],
    },
    {
      id: "5",
      title: `Common ${niche} Mistakes and How to Avoid Them`,
      description: `Explore the most common pitfalls in ${niche} and provide practical solutions to prevent them.`,
      category: "Problem Solving",
      keywords: ["mistakes", "errors", "troubleshooting", niche.toLowerCase()],
    },
    {
      id: "6",
      title: `${niche} Tools and Resources: The Complete Toolkit`,
      description: `A curated list of the best tools, software, and resources available for ${niche} professionals.`,
      category: "Resources",
      keywords: ["tools", "resources", "software", "guides", niche.toLowerCase()],
    },
  ];
}
