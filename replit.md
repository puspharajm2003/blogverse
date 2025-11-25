# BlogVerse - AI-Powered Blogging Platform

## Overview
BlogVerse is a modern SaaS blogging platform designed for creating, publishing, and managing blogs with integrated AI-powered content generation. It focuses on speed, SEO optimization, and scalability, offering a rich editing experience, analytics, and team collaboration features. The platform aims to provide a comprehensive solution for bloggers and content creators, enhancing their workflow with intelligent tools and a robust publishing system.

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Schema**: Includes Users (authentication, plans, admin), Blogs (multi-tenant, themes), Articles (content, states, SEO), Analytics Events, Chat Messages, and Achievements.

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