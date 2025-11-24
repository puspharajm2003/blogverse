# BlogVerse - AI-Powered Blogging Platform

## Overview

BlogVerse is a modern SaaS blogging platform that enables users to create, publish, and manage blogs with AI-powered content generation capabilities. The platform emphasizes speed, SEO optimization, and scalability while providing a rich editing experience with analytics and team collaboration features.

## Recent Changes (November 24, 2025)

### New Features Implemented
1. **Dark Mode Toggle** - Connected to next-themes for seamless light/dark mode switching in Settings
2. **Scheduled Article Publishing** - Added `scheduledPublishAt` field to articles table for future publication
3. **PDF/Document Export** - Integrated html2pdf library for exporting articles to PDF format
4. **Plagiarism Checker** - Foundation for plagiarism detection with simulated checking and extensible API

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
  - Users: Authentication and profile data with plan tracking (free/pro/enterprise)
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

**Security**
- bcrypt for password hashing
- JWT token verification on protected routes
- Authorization headers for API requests

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

### Key Design Patterns

**Component Architecture**
- Reusable UI components from shadcn/ui
- Layout components (SidebarLayout) for consistent page structure
- Feature-specific components (AiChatbot, ContentBrainstorm, RichTextEditor)

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
- next-themes (theme management)

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
