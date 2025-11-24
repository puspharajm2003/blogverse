# BlogVerse - AI-Powered Blogging Platform

## Overview

BlogVerse is a modern SaaS blogging platform that enables users to create, publish, and manage blogs with AI-powered content generation capabilities. The platform emphasizes speed, SEO optimization, and scalability while providing a rich editing experience with analytics and team collaboration features.

## Recent Changes (November 24, 2025)

### Latest Feature Additions
1. **Reading Time Estimation** - Automatic word count → reading time calculation:
   - Displays in editor header next to word count
   - Shows in draft preview and article views
   - Calculated at 220 words per minute standard
   - Utility functions in `lib/reading-time.ts`

2. **Autosave with Visual Indicator** - Automatic draft saving:
   - Autosaves every 30 seconds during editing
   - Visual save status indicator in editor header (Saving... → Saved)
   - Color-coded status: Amber (Draft), Blue (Saving), Green (Saved)
   - Togglable autosave feature

3. **Shareable Draft Preview Links** - Get feedback before publishing:
   - Copy draft preview link directly from editor settings
   - Public URL to preview drafts: `/draft-preview/:articleId`
   - Share link with collaborators for feedback
   - Displays article with reading time and tags
   - Shows share link with copy-to-clipboard button

4. **Tags & Categories Management** - Organize articles with topics:
   - Add tags via input field with Enter key or Add button
   - Click tags to remove them
   - Visual badge display of all tags
   - Tags persist with article in database
   - Filter articles by tags in PublicBlog

### Previously Implemented Features
1. **Advanced Article Publishing System** - Two-mode publish workflow:
   - **Publish Now**: Immediate publication with current date/time
   - **Schedule for Later**: Custom date/time selection for future publication
   - Real-time current date/time display in publish dialog
   - Success notifications showing publication confirmation and shareable link
   - Error notifications with detailed failure reasons

2. **Draft Article Management** - Right-side expandable panel on MyBlogs page:
   - Display only titles and dates (no content preview)
   - Smooth fade-in animations with 3D shadow effects
   - Quick access to Edit and Publish buttons for drafts
   - Auto-removes drafts from panel after successful publication

3. **Integrated Plagiarism Checker** - Full end-to-end implementation:
   - **Backend**: Real plagiarism scoring algorithm analyzing content uniqueness
   - **Storage**: `plagiarismChecks` database table for result history
   - **API Endpoints**: 
     - POST `/api/plagiarism/check` - Perform plagiarism check on article
     - GET `/api/plagiarism/:articleId` - Get check history for article
     - GET `/api/plagiarism/:articleId/latest` - Get latest check result
   - **Frontend Integration**: Plagiarism checker button in article editor
   - **Auto-Save**: Automatically saves article before checking plagiarism
   - **Smart Notifications**: 
     - ✅ Green notification for <15% plagiarism
     - ⚠️ Yellow notification for 15-40% plagiarism
     - ❌ Red notification for >40% plagiarism
   - **Results Display**: Shows overall score, uniqueness percentage, match count, and source details
   - **Check History**: Tracks all plagiarism checks performed on articles

4. **Admin User System** - puspharaj.m2003@gmail.com marked as admin with `isAdmin` field, gets enterprise plan and all features unlocked

5. **Plan-Based Feature Access Control** - Three-tier system:
   - **Free Plan**: Basic features (dark mode, limited articles)
   - **Pro Plan**: Advanced features (scheduled publishing, PDF export, plagiarism checker)
   - **Enterprise Plan**: All features including custom domain
   - **Admin Override**: Admin users bypass all feature gates

6. **Dark Mode** - Connected to next-themes with system preference detection

7. **Scheduled Publishing** - Future publication with `scheduledPublishAt` field

8. **PDF/Document Export** - html2pdf integration for articles

9. **Achievement System** - 8 achievements across 4 tiers with progress tracking

10. **Real-Time Dashboard** - Auto-refreshing metrics every 5 seconds with real database data

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React with Vite**: Modern build tooling for fast development and optimized production builds
- **TypeScript**: Type-safe development across the entire frontend
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management with client-side caching

**UI Framework**
- **shadcn/ui**: Component library built on Radix UI primitives
- **Tailwind CSS v4**: Utility-first CSS with custom design tokens
- **Theme System**: next-themes for dark/light mode support with system preference detection
- **Typography**: Multi-font stack (Inter for UI, Playfair Display for editorial content, JetBrains Mono for code)

**Dark Mode Implementation**
- **System**: Uses next-themes with Tailwind class strategy
- **Locations**: Settings page toggle + Quick access toggles in navbar and sidebar
- **Persistence**: Theme preference saved to localStorage
- **System Detection**: Automatically detects system preference (light/dark) on first visit
- **Smooth Transitions**: CSS transitions for theme changes

**Rich Text Editor**
- **TipTap**: Based on ProseMirror for extensible WYSIWYG editing
- **Extensions**: Typography, Link, Image, Placeholder support
- Serif font styling for blog-like writing experience

**Data Visualization**
- **Recharts**: Analytics charts (Area, Bar, Line, Pie, Scatter charts)
- Dashboard metrics and article performance tracking

### Backend Architecture

**Server Framework**
- **Express.js**: REST API with TypeScript
- **Development Mode**: Vite middleware integration for HMR
- **Production Mode**: Pre-built static assets served from dist directory

**Application Structure**
- Monorepo pattern with shared schema between client and server
- Path aliases (@, @shared, @assets) for clean imports
- Separate dev and production entry points

### Database & ORM

**Database**
- **PostgreSQL**: Primary data store via Neon serverless
- **Drizzle ORM**: Type-safe database queries with schema migrations
- **Schema Design**:
  - Users: Authentication and profile data with plan tracking (free/pro/enterprise) and admin flag
  - Blogs: Multi-tenant blog instances with customizable themes
  - Articles: Content with draft/published/scheduled states, SEO metadata, scheduling support
  - Analytics Events: View tracking and engagement metrics
  - Chat Messages: AI conversation history
  - Achievements: User achievement milestones with tier system
  - User Achievements: Progress tracking for achievements

**Data Access Layer**
- Storage abstraction (IStorage interface) for database operations
- Supports user authentication, blog management, article CRUD, analytics recording, and chat history

### Authentication & Authorization

**Current Implementation**
- Custom JWT-based authentication
- Email/password signup and login
- Token stored in localStorage
- Demo account generation for quick access
- User context via React Context API
- Admin detection on signup for puspharaj.m2003@gmail.com

**Security**
- bcrypt for password hashing
- JWT token verification on protected routes
- Authorization headers for API requests
- Admin privileges automatically assigned to designated email

### AI Integration

**Content Generation**
- Professional content prompts for different generation types:
  - Full blog posts (800-1000 words, SEO-optimized)
  - Sections/paragraphs (300-500 words)
  - Outlines with keyword targeting
  - Title variations
  - Meta descriptions
  - Tags
- Chat-based interface for iterative content creation
- Content brainstorming with niche-based idea generation
- Persistent chat history per user
- Fallback to demo content when API unavailable

### Document & Export Features

**Article Export**
- PDF export functionality using html2pdf for professional formatting
- Document export as text/plaintext format
- Preserves formatting and metadata during export

**Plagiarism Detection**
- Simulated plagiarism checker for development/testing
- Extensible architecture for API integration
- Analyzes content uniqueness and similarity scores

### Achievement System

**Features**
- 8 default achievements across 4 tiers (Bronze, Silver, Gold, Platinum)
- Achievement types: articles published, total views, consecutive publishing days
- Progress tracking with point rewards
- User achievement unlock history

**Achievements Include**
- First Post (1 article) - 10 points
- Five Articles - 25 points
- Ten Articles - 50 points
- Twenty Five Articles - 100 points
- Fifty Articles - 250 points
- Consistency Champion (7 consecutive days) - 75 points
- 1000 Views - 30 points
- Popular Creator (10000 views) - 150 points

### API Design

**RESTful Endpoints**
- `/api/auth/*`: Signup, login, demo account creation
- `/api/user/*`: Profile management, user blogs
- `/api/blogs/*`: Blog CRUD operations
- `/api/articles/*`: Article management
- `/api/analytics/*`: Event recording, statistics retrieval
- `/api/ai/*`: Content generation, chat, brainstorming
- `/api/chat/*`: Message history
- `/api/achievements/*`: Achievement management and user progress
- `/api/plagiarism/*`: Plagiarism detection (future integration)

**Response Format**
- JSON responses with error/success indicators
- Consistent error handling patterns
- Request/response logging for debugging
- User data includes plan, isAdmin, avatar, bio

### Key Design Patterns

**Component Architecture**
- Reusable UI components from shadcn/ui
- Layout components (SidebarLayout) for consistent page structure
- Feature-specific components (AiChatbot, ContentBrainstorm, RichTextEditor)
- FeatureGate component for plan-based access control

**Data Flow**
- React Query for async state management with automatic refetching
- Optimistic updates for better UX
- Auto-refresh for real-time dashboard stats (5-second intervals)

**Code Organization**
- Feature-based routing (pages directory)
- Shared components in components directory
- UI primitives in components/ui
- Custom hooks for reusable logic
- Utility functions for common operations

## External Dependencies

### Third-Party Services

**Database**
- **Neon Serverless PostgreSQL**: Managed PostgreSQL with serverless driver
- **MCP Integration**: Neon MCP server for database operations

**Development Tools**
- **Replit Plugins**: Runtime error modal, cartographer, dev banner for Replit environment
- **esbuild**: Server-side bundling for production
- **Drizzle Kit**: Database migrations and schema management

### Key NPM Packages

**UI & Components**
- @radix-ui/* (30+ primitive components)
- lucide-react (icon library)
- recharts (data visualization)
- embla-carousel-react (carousels)
- vaul (drawer component)
- cmdk (command palette)
- input-otp (OTP input)

**Theme & Dark Mode**
- next-themes (theme management with system preference detection)

**Editor & Export**
- @tiptap/react and extensions
- ProseMirror-based editing
- pdfkit (PDF generation)
- html2pdf.js (Document export)

**Forms & Validation**
- react-hook-form
- @hookform/resolvers
- zod (schema validation via drizzle-zod)

**Utilities**
- clsx & tailwind-merge (className utilities)
- class-variance-authority (variant management)
- nanoid (ID generation)
- bcryptjs (password hashing)
- jsonwebtoken (JWT tokens)
- date-fns (date manipulation)

**Build & Dev**
- @vitejs/plugin-react
- @tailwindcss/vite
- tsx (TypeScript execution)
- postcss & autoprefixer

### Asset Management

- Static assets in attached_assets directory
- Generated images for hero backgrounds
- Favicon and OG images for SEO

### Environment Requirements

- `DATABASE_URL`: PostgreSQL connection string (required)
- `OPENAI_API_KEY`: OpenAI API for content generation
- `OPENROUTER_API_KEY`: Alternative AI model access
- Node.js environment for server execution
- Port 5000 for Vite dev server
