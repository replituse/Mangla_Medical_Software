# Mangala Medicos - Pharmacy Management System

## Overview

This is a full-stack pharmacy management system built for Mangala Medicos, a retail pharmacy business. The application provides inventory management, POS billing with GST calculations, customer tracking, supplier management, and sales analytics. It's designed to streamline daily pharmacy operations including medicine stock management, expiry tracking, low-stock alerts, and invoice generation with print capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with a custom medical-green theme (emerald color palette)
- **Forms**: React Hook Form with Zod validation
- **Typography**: DM Sans (body) and Outfit (display) fonts

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with typed route definitions in `shared/routes.ts`
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Schema Validation**: Zod schemas with drizzle-zod integration for type-safe database operations
- **Authentication**: Replit Auth integration using OpenID Connect (OIDC) with Passport.js
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple

### Data Layer
- **Database**: PostgreSQL (provisioned via Replit)
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for schema migrations (`db:push` command)
- **Key Tables**: medicines, suppliers, customers, invoices, invoice_items, users, sessions

### Shared Code
- The `shared/` directory contains code used by both frontend and backend:
  - `schema.ts`: Database table definitions and Zod validation schemas
  - `routes.ts`: API route definitions with type-safe input/output schemas
  - `models/auth.ts`: User and session table definitions for Replit Auth

### Authentication Flow
- Uses Replit Auth (OIDC) for user authentication
- Session stored in PostgreSQL `sessions` table
- Protected routes check authentication via `isAuthenticated` middleware
- User data stored in `users` table with automatic upsert on login

### Key Features
- **Medicine Management**: CRUD operations with batch tracking, expiry dates, GST percentages
- **POS Billing**: Cart-based checkout with GST calculations and invoice generation
- **Print Support**: React-to-print integration for invoice printing
- **Dashboard Analytics**: Real-time stats for sales, low stock, and expiring items
- **Customer Database**: Track customer purchases and contact information
- **Supplier Management**: Maintain supplier records with GST numbers

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Database queries and schema management

### Authentication
- **Replit Auth**: OpenID Connect authentication provider
- **Environment Variables Required**:
  - `DATABASE_URL`: PostgreSQL connection string
  - `SESSION_SECRET`: Secret for session encryption
  - `ISSUER_URL`: OIDC issuer (defaults to Replit)
  - `REPL_ID`: Replit environment identifier

### Third-Party Libraries
- **react-to-print**: Browser-based invoice printing
- **date-fns**: Date formatting and manipulation
- **Radix UI**: Accessible UI component primitives
- **TanStack Query**: Data fetching and caching
- **Zod**: Runtime type validation

### Replit-Specific Integrations
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Development tooling
- **@replit/vite-plugin-dev-banner**: Development environment indicator