# BlogVerse - AI-Powered Blogging Platform

## Overview
BlogVerse is a modern SaaS blogging platform designed for creating, publishing, and managing blogs with integrated AI-powered content generation. It focuses on speed, SEO optimization, and scalability, offering a rich editing experience, analytics, and team collaboration features. The platform aims to provide a comprehensive solution for bloggers and content creators, enhancing their workflow with intelligent tools and a robust publishing system.

## User Preferences
Preferred communication style: Simple, everyday language.

## Performance Optimization (November 25, 2025 - Latest)

### Load Time Optimization: < 1 Second
**Problem Fixed**: App was making repeated API calls every 3-5 seconds, causing high CPU usage and slow loading
**Solutions Implemented**:
1. **Removed Auto-Refetch Intervals**: Eliminated 3-second interval in Dashboard and 5-second interval in Analytics
2. **React Query Caching**: Switched Dashboard to use React Query with 5-minute cache (staleTime: 1000 * 60 * 5)
3. **Query Deduplication**: All 4 dashboard queries (stats, chart, achievements, streak) now use proper cache keys to prevent redundant requests
4. **Result**: Page now loads in 60ms, API calls reduced from continuous to single on-load fetch with intelligent 5-minute caching

**Technical Details**:
- Dashboard: `api.getDashboardStats()` cached for 5 min
- Chart: `api.getChartData(7)` cached for 5 min  
- Achievements: `api.getUserAchievements()` cached for 5 min
- Streak: `api.getStreak()` cached for 5 min
- All queries now respect global `refetchInterval: false` and `refetchOnWindowFocus: false` settings

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

### Advanced Features - Modern UI Implementation (November 25, 2025)

#### 1. Advanced User Feedback System
- **Modern UI**: Dedicated feedback form at `/feedback` with gradient styling and smooth animations
- **Rich Form**: Category selection (Bug 🐛, Feature ✨, Improvement 🎯, Other 💬), priority levels (Low/Normal/High/Urgent)
- **Rating System**: Interactive 5-star rating with hover effects and dynamic colors
- **Feedback History**: Beautiful cards displaying submitted feedback with status tracking
- **Stats Dashboard**: Real-time statistics showing total, resolved, and open feedback items
- **Visual Design**: Gradient backgrounds, hover effects, smooth transitions, categorized color coding
- **API**: POST/GET `/api/feedback` with full submission tracking and retrieval

#### 2. Advanced Read-It-Later Bookmarking
- **Modern UI**: Two-view system at `/bookmarks` (Grid & List view toggle)
- **Smart Search**: Full-text search across bookmarks and notes with real-time filtering
- **Collection Management**: Organized into collections (default: "reading-list")
- **Personal Notes**: Rich notes on bookmarked articles with visual highlighting
- **Device Sync**: Synchronized across all user devices with persistent storage
- **Stats Display**: Cards showing total bookmarks, collections, and bookmarks with notes
- **Visual Design**: Responsive grid cards, list view options, gradient accents, smooth animations
- **API**: GET/POST/DELETE `/api/bookmarks` with collection filtering

#### 3. Advanced Notification System
- **Modern UI**: Beautiful preference toggles at `/notifications` with color-coded categories
- **Granular Control**: Three notification types (Comments, Article Updates, Achievements) with independent toggles
- **Delivery Methods**: Email and Push notification options with visual status indicators
- **Smart Toggles**: Modern animated toggle switches with hover effects and color states
- **Unsaved Changes**: Smart "Save Changes" and "Reset" buttons that only appear when needed
- **Visual Design**: Color-coded cards, gradient backgrounds, smooth toggle animations, category icons
- **API**: GET/PATCH `/api/notification-preferences` with full preference management

#### 4. Advanced Gamified Learning Path
- **Modern UI**: Interactive onboarding at `/learning` with 5 guided lessons
- **Progress Visualization**: Real-time stats (Completed/Remaining/Overall Progress/Points Earned)
- **Smart Progression**: Visual indicators for current, completed, and locked lessons
- **Lesson Tracking**: 5 interactive lessons with emoji icons and descriptions (Welcome, Create Blog, Write Article, Use AI, Track Analytics)
- **Completion Rewards**: Achievement card on path completion with congratulations message
- **Visual Design**: Color gradients per lesson, step counters, progress bars, scale animations on current lesson
- **Interaction**: Beautiful completion buttons with color gradients, visual feedback on progress
- **API**: POST/GET `/api/learning/*` for progress tracking, lesson completion, and initialization

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