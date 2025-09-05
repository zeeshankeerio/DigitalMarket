# Overview

This is a modern e-commerce web application designed for selling digital products like software licenses, PC/console games, gift cards, and activation keys. Built as a full-stack TypeScript application, it follows a marketplace model similar to G2A/G2G with comprehensive features including product management, secure checkout, and digital delivery systems. The application supports both traditional credit card payments via Stripe and cryptocurrency payments, with automated digital key delivery upon successful purchase.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript running on Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing with conditional rendering based on authentication state
- **UI Components**: Radix UI primitives with shadcn/ui component library for consistent, accessible design
- **Styling**: Tailwind CSS with CSS variables for theming, supporting both light and dark modes
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations and migrations
- **Authentication**: Replit Auth with OpenID Connect integration and session-based authentication
- **File Structure**: Monorepo structure with shared schema definitions between client and server

## Data Storage Solutions
- **Primary Database**: PostgreSQL hosted on Neon with connection pooling
- **ORM**: Drizzle ORM with TypeScript-first schema definitions in `/shared/schema.ts`
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **Database Management**: Drizzle Kit for migrations and schema management

## Authentication and Authorization
- **Provider**: Replit Auth using OpenID Connect protocol
- **Session Management**: Express sessions with PostgreSQL storage and 7-day TTL
- **Authorization**: Role-based access control with admin privileges for product management
- **Security**: HTTPS enforcement, secure cookies, and CSRF protection

## External Dependencies

### Payment Processing
- **Stripe**: Primary payment processor for credit/debit card transactions with webhook support
- **Crypto Payments**: Planned integration for cryptocurrency payments (infrastructure ready)

### Database Services
- **Neon**: PostgreSQL database hosting with serverless capabilities
- **Connection Management**: @neondatabase/serverless for optimized database connections

### UI and Styling
- **Radix UI**: Comprehensive primitive components for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide Icons**: Icon library for consistent iconography

### Development Tools
- **Vite**: Build tool and development server with HMR
- **TypeScript**: Type safety across the entire application stack
- **ESBuild**: Fast bundling for production builds

### Hosting and Infrastructure
- **Replit**: Primary hosting platform with integrated development environment
- **WebSocket Support**: For real-time features via ws library