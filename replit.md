# BlogVerse - AI-Powered Blogging Platform

## Overview
BlogVerse is a modern SaaS blogging platform designed for creating, publishing, and managing blogs with integrated AI-powered content generation. It focuses on speed, SEO optimization, and scalability, offering a rich editing experience, analytics, and team collaboration features. The platform aims to provide a comprehensive solution for bloggers and content creators, enhancing their workflow with intelligent tools and a robust publishing system.

## User Preferences
Preferred communication style: Simple, everyday language.

## Recent Changes (November 25, 2025)

### Achievement System - Consistency Rewards
- **Streak Tracking**: Tracks consecutive days of article publication
- **Consistency Achievements**: 4-tier system rewarding sustained content creation
  - 🚀 "Getting Started" - 3 consecutive days (Bronze, 25 pts)
  - 🔥 "Consistency Champion" - 7 consecutive days (Silver, 75 pts)
  - ⚡ "Unstoppable Writer" - 14 consecutive days (Gold, 150 pts)
  - 💪 "Content Machine" - 30 consecutive days (Platinum, 300 pts)
- **Database Tables**: `user_streaks` tracks current/longest streaks per user
- **Smart Streaking Logic**: Resets if no publication on consecutive day; tracks longest streak
- **Dashboard Display**: Beautiful "Your Streak" card showing current streak and personal best
- **API Endpoints**: POST/GET `/api/user/streak`, enhanced `/api/achievements/check`
- **Auto-unlock**: Achievements unlock automatically when streak milestones are reached

### Six Major Features Implemented

#### 1. User Feedback System
- Dedicated feedback form at `/feedback` with rich input options
- Categories: bug report, feature request, improvement, other
- Priority levels: low, normal, high, urgent
- Star rating system (1-5 stars) for user satisfaction
- Database persistence and admin review capability
- API endpoints: POST/GET `/api/feedback`

#### 2. Read-It-Later Bookmarking
- Save articles for later at `/bookmarks`
- Organized into collections (default: "reading-list")
- Personal notes on bookmarked articles
- Device synchronization across all user devices
- Quick bookmark status check with API `/api/bookmarks/check/:articleId`
- API endpoints: POST/DELETE/GET `/api/bookmarks`

#### 3. Notification System
- Configurable notification preferences at `/notifications`
- Types: new comments, article updates, achievements unlocked
- Delivery methods: email, push notifications
- Mark notifications as read individually or bulk
- Unread notification filtering
- Persistent notification history
- API endpoints: GET/PATCH/DELETE `/api/notifications`, GET/PATCH `/api/notification-preferences`

#### 4. Gamified Learning Path
- Onboarding learning path at `/learning` for new users
- 5 guided lessons: welcome, create blog, write article, use AI, track analytics
- Progress tracking with visual progress bar (0-100%)
- Lesson completion tracking and timestamps
- Auto-completion detection when all lessons done
- API endpoints: POST/GET `/api/learning/*` for initialization, progress, status, and completion

#### 5. Article Import with SEO Analysis & Quality Metrics
- Bulk import articles from exported content at `/import`
- Parse text/plain articles exported from other platforms
- **SEO Analysis**: Automatic scoring for title, content, keywords, readability
- **Quality Metrics**: Overall SEO score (0-100), word count, reading time estimates
- **Actionable Suggestions**: AI-powered recommendations for SEO optimization
- **Batch Processing**: Import multiple articles with progress tracking
- **Visual Dashboard**: Cards showing parsed articles with individual SEO scores
- Statistics: Total articles, average SEO score, total words
- Database tables: `import_batches` (tracking import sessions), `seo_metrics` (storing analysis)
- API endpoints: POST `/api/articles/import`, GET `/api/import/batches`, GET `/api/articles/:articleId/seo`
- Features:
  - Automatic keyword extraction
  - Title optimization scoring (30-60 character sweet spot)
  - Content depth analysis (500+ word recommendation)
  - Readability assessment
  - Customizable import status (draft/published)

### Advanced UI Enhancements & AI Features (Previous)

#### 1. Published Articles Page (Complete Redesign)
- Modern card and list view layouts with smooth transitions
- Advanced stats section (total articles, views, avg read time)
- Grid/List view toggle with instant animations
- Staggered card load animations
- Gradient accents and professional styling
- Enhanced metadata display on each card
- Optimized hover effects with scale and shadow

#### 2. My Articles Page Parallax Effect
- Animated background elements with different parallax speeds
- Three layered background circles moving at different rates
- Creates depth and visual interest during scrolling
- Smooth continuous animations (20s, 25s, 30s cycles)
- Maintains responsive design without affecting interaction

#### 3. AI-Generated Tags Feature
- "Generate Tags" button on each article card (magic wand icon)
- Uses OpenRouter API to analyze article content
- Generates 8-10 relevant, searchable tags automatically
- SEO-optimized keywords (long-tail, broad, industry-specific terms)
- Tags ordered by relevance
- Updates article immediately after generation
- Fallback to demo tags if API unavailable

#### 4. My Articles & Dashboard Enhancements (Previous)
- Quick Edit Button for rapid title/tag changes
- Reading Challenge Widget with weekly/monthly goals
- Progress tracking and motivational messages
- Dark Mode Toggle with system preference support
- Enhanced theme settings page

## System Architecture

### Frontend Architecture
- **Frameworks**: React with Vite for fast development, TypeScript for type safety, Wouter for lightweight routing.
- **UI/UX**: shadcn/ui components built on Radix UI, Tailwind CSS v4 for styling, next-themes for dark/light mode with system preference detection.
- **Rich Text Editor**: TipTap (ProseMirror-based) with extensions for a rich writing experience.
- **Data Visualization**: Recharts for analytics dashboards.

### Backend Architecture
- **Server**: Express.js with TypeScript for a REST API.
- **Structure**: Monorepo pattern with shared schema, path aliases.

### Database & ORM
- **Database**: PostgreSQL via Neon serverless.
- **ORM**: Drizzle ORM for type-safe queries and schema migrations.
- **Schema**: Includes Users (authentication, plans, admin), Blogs (multi-tenant, themes), Articles (content, states, SEO), Analytics Events, Chat Messages, Achievements, Feedback, Bookmarks, Notifications, and Learning Progress.

### Authentication & Authorization
- **Authentication**: Custom JWT-based system with email/password login and demo account generation.
- **Security**: bcrypt for password hashing, JWT verification, authorization headers.
- **Access Control**: Three-tier plan system (Free, Pro, Enterprise) with feature gating; admin override.

### AI Integration
- **Content Generation**: AI-powered prompts for full blog posts, sections, outlines, titles, meta descriptions, and tags.
- **Interface**: Chat-based for iterative content creation and brainstorming, with persistent history.

### Document & Export Features
- **Article Export**: PDF export using html2pdf, and plaintext export.
- **Plagiarism Detection**: Provides plagiarism scoring, uniqueness analysis, and match source details.

### Achievement System
- **Features**: 8 achievements across 4 tiers (Bronze, Silver, Gold, Platinum) based on articles published, views, and consistency. Includes progress tracking and points.

### API Design
- **RESTful Endpoints**: Covers authentication, user, blog, article, analytics, AI, chat, and achievement management.
- **Format**: JSON responses with consistent error handling.

### Key Design Patterns
- **Component Architecture**: Reusable UI, layout, and feature-specific components. FeatureGate for access control.
- **Data Flow**: React Query for async state management, optimistic updates, auto-refresh for real-time data.
- **Code Organization**: Feature-based routing, shared components, custom hooks, utility functions.

## External Dependencies

### Third-Party Services
- **Database**: Neon Serverless PostgreSQL.
- **AI**: OpenAI API, OpenRouter API (alternative).

### Key NPM Packages
- **UI**: @radix-ui/*, lucide-react, recharts, embla-carousel-react, vaul, cmdk, input-otp.
- **Theme**: next-themes.
- **Editor & Export**: @tiptap/react and extensions, pdfkit, html2pdf.js.
- **Forms & Validation**: react-hook-form, @hookform/resolvers, zod.
- **Utilities**: clsx, tailwind-merge, class-variance-authority, nanoid, bcryptjs, jsonwebtoken, date-fns.
- **Build & Dev**: @vitejs/plugin-react, @tailwindcss/vite, tsx, postcss, autoprefixer.

### Asset Management
- Static assets in `attached_assets` directory.
- Generated images for backgrounds, favicon, and OG images.

### Environment Requirements
- `DATABASE_URL` (PostgreSQL connection string).
- `OPENAI_API_KEY` (OpenAI API for content generation).
- `OPENROUTER_API_KEY` (Alternative AI model access).
- Node.js environment.
- Port 5000 for Vite dev server.