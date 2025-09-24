# Project Structure & Organization

## Root Directory Layout

```
├── app/                    # Next.js App Router pages and layouts
├── components/             # Reusable React components
├── lib/                    # Utility functions and configurations
├── scripts/                # Database migration scripts
├── .kiro/                  # Kiro AI assistant configuration
└── Configuration files     # Package.json, configs, etc.
```

## App Directory Structure

### Core Pages
- `app/page.tsx` - Landing page with church information and registration CTA
- `app/layout.tsx` - Root layout with fonts and global styles
- `app/globals.css` - Global CSS styles and Tailwind imports

### Feature Directories
- `app/auth/` - Authentication pages (login, register, admin-login)
- `app/dashboard/` - Member dashboard and profile management
- `app/admin/` - Administrative interface for member management
- `app/api/` - API routes for server-side operations

## Components Organization

### UI Components (`components/ui/`)
- shadcn/ui components (Button, Card, Input, etc.)
- Consistent design system components
- Reusable form elements and layouts

### Feature Components (`components/`)
- `admin-stats.tsx` - Administrative dashboard statistics
- `attendance-history.tsx` - Member attendance tracking display
- `members-table.tsx` - Admin interface for member management
- `profile-form.tsx` - Member registration and profile editing
- `profile-picture-upload.tsx` - Image upload functionality
- `rank-management-dashboard.tsx` - Spiritual ranking system interface

## Library Structure (`lib/`)

### Core Utilities
- `utils.ts` - Common utility functions (cn for className merging)
- `client.ts` - Supabase client configuration for client-side
- `server.ts` - Supabase client configuration for server-side
- `middleware.ts` - Authentication and route protection logic

## Database Scripts (`scripts/`)

### Migration Files (Sequential)
- `001_create_profiles_table.sql` - Member profiles schema
- `002_create_attendance_table.sql` - Attendance tracking schema
- `003_create_profile_trigger.sql` - Profile automation triggers
- `004_create_updated_at_trigger.sql` - Timestamp update triggers
- `005_add_username_optional_email.sql` - Schema modifications

## Naming Conventions

### Files & Directories
- **kebab-case** for file names (`profile-form.tsx`)
- **PascalCase** for React components (`ProfileForm`)
- **camelCase** for functions and variables
- **SCREAMING_SNAKE_CASE** for constants

### Database
- **snake_case** for table and column names
- **Descriptive names** for constraints and indexes
- **Prefixed** migration files with sequential numbers

## Import Patterns

### Path Aliases
- `@/components` - Components directory
- `@/lib` - Library utilities
- `@/app` - App directory (when needed)

### Import Order
1. React and Next.js imports
2. Third-party libraries
3. Internal components (using @/ aliases)
4. Relative imports
5. Type-only imports (with `type` keyword)

## Component Patterns

### Server Components (Default)
- Used for data fetching and static content
- No client-side interactivity
- Better performance and SEO

### Client Components
- Marked with `"use client"` directive
- Used for forms, interactive elements
- Event handlers and state management

### Server Actions
- Marked with `"use server"` directive
- Used for form submissions and mutations
- Direct database operations with Supabase