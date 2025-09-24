# Technology Stack & Build System

## Core Technologies

### Frontend Framework
- **Next.js 14.2.25** with App Router architecture
- **React 19** with TypeScript for type safety
- **Server Components** for optimal performance and SEO

### Styling & UI
- **Tailwind CSS 4.1.9** for utility-first styling
- **shadcn/ui** component library with Radix UI primitives
- **Lucide React** for consistent iconography
- **CSS Variables** for theming support
- **Geist Font** for modern typography

### Backend & Database
- **Supabase** for authentication and database
- **PostgreSQL** with Row Level Security (RLS)
- **Server Actions** for form handling and mutations

### Key Libraries
- **React Hook Form** with Zod validation for forms
- **date-fns** for date manipulation
- **Recharts** for data visualization
- **Sonner** for toast notifications
- **class-variance-authority** for component variants

## Build System & Commands

### Development
```bash
pnpm dev          # Start development server on localhost:3000
pnpm build        # Build production application
pnpm start        # Start production server
pnpm lint         # Run ESLint for code quality
```

### Package Manager
- **pnpm** is the preferred package manager
- Lock file: `pnpm-lock.yaml`

## Architecture Patterns

### File Structure
- **App Router** with file-based routing in `/app`
- **Server Components** by default, Client Components when needed
- **API Routes** in `/app/api` for backend endpoints
- **Middleware** for authentication and route protection

### Database Schema
- **profiles** table for member data with RLS policies
- **attendance** table for event tracking
- **Triggers** for automatic timestamp updates
- **Admin permissions** through `is_admin` boolean flag

### Authentication Flow
- Supabase Auth with email/password
- Protected routes via middleware
- Role-based access control (admin vs member)

## Configuration Files
- `next.config.mjs` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS setup
- `components.json` - shadcn/ui configuration
- `tsconfig.json` - TypeScript compiler options