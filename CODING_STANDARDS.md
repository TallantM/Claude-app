# SDLC Hub — Coding Standards

These standards define how we write, organize, and maintain code across the SDLC Hub project. Every contributor should follow these conventions to keep the codebase consistent and easy to work with.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router (pages + API routes)
│   ├── (app)/             # Protected routes (require auth)
│   ├── (auth)/            # Public auth routes (login, register)
│   └── api/               # REST API endpoints
├── components/
│   ├── layout/            # Shell components (header, sidebar, app-layout)
│   └── ui/                # Reusable UI primitives (button, card, dialog, etc.)
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities, helpers, and server-side config
├── store/                 # Zustand global state stores
└── types/                 # Shared TypeScript types, interfaces, and enums
```

**Rules:**
- One component per file. Name the file after the component in kebab-case.
- Keep API route files focused — one resource per directory.
- UI primitives go in `components/ui/`. Page-specific components stay in the page file unless they're reused.

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Files & directories | kebab-case | `use-pagination.ts`, `app-layout.tsx` |
| React components | PascalCase | `ProjectsPage`, `LoadingSkeleton` |
| Functions & variables | camelCase | `fetchDashboard`, `statusFilter` |
| Hooks | camelCase with `use` prefix | `usePagination`, `useSidebarStore` |
| TypeScript interfaces | PascalCase | `UserProfile`, `PaginatedResponse<T>` |
| Enums | PascalCase name, UPPER_SNAKE values | `TaskStatus.IN_PROGRESS` |
| Constants | UPPER_SNAKE_CASE | `PAGINATION_DEFAULTS`, `PAGE_SIZE_OPTIONS` |
| CSS/Tailwind | Utility classes only | No custom CSS class names |
| API endpoints | Lowercase plural nouns | `/api/projects`, `/api/issues` |
| Boolean state | Descriptive without `is` prefix for simple flags | `loading`, `submitting`, `enabled` |
| Dialog state | `{purpose}DialogOpen` pattern | `createDialogOpen`, `detailDialogOpen` |

---

## Import Order

Keep imports in this order, separated by blank lines:

```typescript
// 1. React and Next.js
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 2. Third-party libraries
import { useForm } from "react-hook-form";
import { z } from "zod";

// 3. Internal components (using @/ alias)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// 4. Internal utilities, hooks, and stores
import { formatDate, cn } from "@/lib/utils";
import { usePagination } from "@/hooks/use-pagination";

// 5. Types (use `import type` when importing only types)
import type { ProjectSummary, TaskWithRelations } from "@/types";
```

---

## TypeScript

- **Interfaces** for object shapes. **Types** for unions, intersections, or mapped types.
- **Enums** for fixed domain values (statuses, roles, priorities).
- **Generics** where the function operates on variable types (`PaginatedResponse<T>`, `usePagination<T>`).
- **Zod schemas** for all runtime validation. Infer input types from them:

```typescript
export const projectSchema = z.object({ ... });
export type ProjectInput = z.infer<typeof projectSchema>;
```

- Prefer explicit return types on exported functions.
- Use `import type` when importing only type information.

---

## React Components

### Structure

Every page component follows this order:

```typescript
"use client";

// Imports

// Local types/interfaces (if page-specific)

// Helper functions (if page-specific)

// Loading skeleton component

// Main page component:
//   1. State declarations
//   2. Hooks (usePagination, useForm, etc.)
//   3. Event handlers and callbacks
//   4. Derived/computed values
//   5. Early returns (loading, error)
//   6. JSX return
```

### State Management

Use the right tool for the job:

| Scope | Tool | When |
|-------|------|------|
| Server data + pagination | `usePagination` hook | Any list that fetches from an API |
| Form inputs | React Hook Form + Zod | Any form with validation |
| Local UI state | `useState` | Dialogs, toggles, selections |
| Global app state | Zustand store | Sidebar, notifications, cross-page filters |

### Loading & Error States

Every data-fetching page must handle three states:

```typescript
if (loading) return <LoadingSkeleton />;

if (error) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <p className="text-destructive text-lg font-medium">
          Error loading {resource}
        </p>
        <p className="text-muted-foreground mt-1">{error}</p>
      </div>
    </div>
  );
}

// Happy path JSX
```

### UI Components

- All UI primitives wrap Radix UI with Tailwind styling and use the `cn()` utility for class merging.
- Use `cva` (class-variance-authority) for components with variants.
- Accept `className` prop and merge it via `cn()` so consumers can override styles.
- Use `React.forwardRef` for components that need ref forwarding.

---

## API Routes

### Standard Pattern

Every API route handler follows this structure:

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePaginationParams, getPrismaPageArgs, buildPaginatedResponse } from "@/lib/pagination";

export async function GET(request: Request) {
  try {
    // 1. Parse query params
    const { searchParams } = new URL(request.url);

    // 2. Build Prisma where clause
    const where = {};

    // 3. Paginate and query
    const paginationParams = parsePaginationParams(searchParams);
    const [total, data] = await Promise.all([
      prisma.model.count({ where }),
      prisma.model.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        ...getPrismaPageArgs(paginationParams),
      }),
    ]);

    return NextResponse.json(buildPaginatedResponse(data, total, paginationParams));
  } catch (error) {
    console.error("Error fetching {resource}:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate input
    const body = await request.json();
    const validated = schema.parse(body);

    // 3. Business logic + create
    const record = await prisma.model.create({ data: { ... } });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Error creating {resource}:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

### Response Formats

| Operation | Format | Status |
|-----------|--------|--------|
| List (GET) | `{ data: T[], pagination: {...} }` | 200 |
| Single (GET) | Direct object | 200 |
| Create (POST) | Created object | 201 |
| Update (PATCH) | Updated object | 200 |
| Delete (DELETE) | `{ message: "..." }` | 200 |
| Error | `{ error: "..." }` | 4xx/5xx |

### Input Handling

- Validate all input with Zod schemas.
- Trim string fields either in the Zod schema (preferred) or consistently in the route handler.
- Never trust client input — always validate on the server even if the frontend validates too.

---

## Utility Functions

- Centralize all shared helpers in `src/lib/utils.ts`.
- Color mapping functions (`getStatusColor`, `getPriorityColor`, `getSeverityColor`, `getTypeColor`) all belong in `utils.ts` — never define them locally in page files.
- Keep utility functions pure — no side effects, no state, no DOM access.
- Add a JSDoc comment explaining what the function does and any edge cases.

---

## Comments

Comments should be clean, concise, and sound like a person wrote them.

### When to Comment

- **Do** explain *why* something exists or *why* a non-obvious approach was chosen.
- **Do** add JSDoc comments to exported functions and hooks.
- **Do** use section separators in long files to help navigation.
- **Don't** describe what the code literally does — the code says that already.
- **Don't** leave TODO comments without a plan to address them.

### Style

```typescript
// Section separators for type files and long modules
// ─── Authentication ──────────────────────────────────────

// JSDoc for exported functions
/**
 * Parse page and pageSize from URL query params.
 * Clamps values to safe ranges and falls back to defaults.
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {

// Inline comments for non-obvious logic
const skip = (params.page - 1) * params.pageSize; // zero-indexed offset for Prisma

// JSX section labels in components
{/* Filters */}
{/* Issues List */}
{/* Pagination */}
```

---

## Error Handling

### Server-Side

- Wrap every route handler body in `try/catch`.
- Log errors with `console.error` and include the resource context.
- Return generic error messages to clients — never expose stack traces or internal details.
- Catch Zod validation errors specifically and return the first error message with 400.

### Client-Side

- Use `try/catch` in async functions.
- Narrow error types: `err instanceof Error ? err.message : "An error occurred"`.
- Always set loading to false in a `finally` block.
- Show user-friendly error UI, not raw error objects.

---

## Forms

- Use React Hook Form with `zodResolver` for all forms.
- Define default values in the Zod schema with `.default()` where possible.
- Use `setValue` with `onValueChange` for Radix Select components (they don't support `register`).
- Call `reset()` after successful submission to clear the form.
- Disable submit button while `submitting` is true.

---

## Styling

- **Tailwind CSS only** — no custom CSS files, no CSS modules, no styled-components.
- Use `cn()` from `@/lib/utils` to merge conditional classes.
- Follow the responsive pattern: mobile-first, then `sm:`, `md:`, `lg:`, `xl:` breakpoints.
- Use semantic color tokens: `text-muted-foreground`, `bg-destructive`, `border-input` (not raw colors).
- Dark mode is handled via `dark:` variants — always include them for custom colors.

---

## Git & Workflow

- Branch names: `feature/{description}`, `fix/{description}`, `refactor/{description}`.
- Commit messages: imperative mood, concise. Example: `feat: add pagination to all list endpoints`.
- Keep commits focused — one logical change per commit.
- Run `npm run build` before pushing.
