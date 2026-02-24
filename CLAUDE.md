# SDLC Hub — Test Automation (Spec-Driven Development)

## Start Here

You are implementing test automation for **sdlc-hub** using the **Spec-Driven Development (SDD)** methodology.

**Before writing any code, read these documents in order:**
1. `sdd-framework/specs/META-FRAMEWORK.md` — The complete SDD process (read the whole thing)
2. `sdd-framework/README.md` — Template overview and usage guide
3. `sdd-framework/docs/agent-patterns.md` — How to use AI to generate code from specs

---

## About This Application

**sdlc-hub** is a Software Development Lifecycle management platform — a centralized hub for managing projects, tasks, issues, sprints, CI/CD pipelines, and team collaboration.

### Key Features
- **Authentication** — Email/password login + OAuth (GitHub, Google)
- **Projects** — Kanban board (To Do → In Progress → In Review → Done), task management, sprint planning
- **Issues** — Bug tracker and feature requests with severity, status, assignee
- **Sprints** — Time-boxed iterations (planning, active, completed)
- **Pipelines** — CI/CD pipeline viewer with stages and run history
- **Team** — Member management with roles (admin, project_manager, developer, tester, viewer)
- **Notifications** — In-app notification center
- **Dashboard** — Stats, activity feed, charts
- **Repos** — Git repository tracker

### Pages

**Protected (require auth):**
| Route | Description |
|-------|-------------|
| `/dashboard` | Stats, activity feed, task distribution chart |
| `/projects` | Paginated project list with search/filter |
| `/projects/[id]` | Kanban board, sprints, tasks, milestones |
| `/issues` | Issue tracker with project/status/severity filters |
| `/pipelines` | CI/CD pipeline viewer with run history |
| `/team` | Team members and role management |
| `/notifications` | In-app notification center |
| `/repos` | Git repository tracker |
| `/settings` | User settings (placeholder) |
| `/reports` | Analytics (placeholder) |

**Public (auth pages):**
| Route | Description |
|-------|-------------|
| `/login` | Email/password login form |
| `/register` | New user registration |

### Tech Stack
| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15 |
| Language | TypeScript | 5.7 |
| UI | React, Radix UI, Tailwind CSS | 19 |
| Auth | NextAuth (JWT, credentials + OAuth) | 4.24 |
| Database | Prisma ORM + SQLite | 6.3 |
| State | Zustand | 5 |
| Forms | React Hook Form + Zod | — |
| Icons | Lucide React | — |
| Charts | Chart.js + react-chartjs-2 | — |

**Dev server:** `npm run dev` → http://localhost:3000

### Key Source Files
| Path | Contents |
|------|----------|
| `src/app/` | All Next.js pages and API routes |
| `src/components/` | UI components (layout/, ui/ primitives) |
| `src/lib/auth.ts` | NextAuth configuration |
| `src/lib/pagination.ts` | Reusable pagination utilities |
| `src/lib/validations.ts` | Zod schemas for all inputs |
| `src/hooks/use-pagination.ts` | Generic data-fetching hook |
| `src/store/` | Zustand global state stores |
| `src/types/` | TypeScript types, interfaces, enums |
| `prisma/schema.prisma` | Full database schema |
| `CODING_STANDARDS.md` | Code style conventions (follow these) |

---

## Your Task: Implement Tests Using SDD

Follow the SDD workflow documented in `sdd-framework/specs/META-FRAMEWORK.md`. Here is the order of operations:

### Step 1 — Understand the App
Read the source code to understand what to test:
- `src/app/` — pages and API routes
- `src/components/` — UI components
- `prisma/schema.prisma` — database models
- `CODING_STANDARDS.md` — code style to follow in tests

### Step 2 — Create `specs/PROJECT-SPEC.md`
- Copy `sdd-framework/specs/PROJECT-SPEC.template.md` → `specs/PROJECT-SPEC.md`
- Fill in all `[PLACEHOLDER]` fields for the **TypeScript + Playwright** stack
- Use `sdd-framework/specs/PROJECT-SPEC.csharp-example.md` as a reference for depth and structure
- Adapt patterns to TypeScript/Playwright conventions

### Step 3 — Write Feature Specs
Create feature specs in `specs/features/[feature-name]/` using templates from `sdd-framework/specs/templates/`:

| Template | Use For |
|----------|---------|
| `page-objects.template.md` | Define page interactions (selectors, actions, return values) |
| `unit-tests.template.md` | Define unit test scenarios |
| `integration-tests.template.md` | Define integration test scenarios |
| `workflows.template.md` | Define E2E workflow scenarios |

**Implement specs for these features in order:**
1. `authentication` — login flow, register flow, auth redirects, logout
2. `projects` — list with pagination, create project, view Kanban board
3. `issues` — list with filters, create issue, update status
4. `dashboard` — stats display, activity feed, auth guard

Use `sdd-framework/specs/examples/` as reference — these are C# but show the expected structure and level of detail. Adapt to TypeScript patterns.

### Step 4 — Implement Tests
Generate and implement tests from your specs.

**Test Stack:**
| Type | Framework | Location |
|------|-----------|----------|
| E2E (browser) | Playwright + TypeScript | `tests/e2e/` |
| Unit (components) | Vitest + React Testing Library | `tests/unit/` |

**Install dependencies:**
```bash
# E2E tests
npm install --save-dev @playwright/test
npx playwright install --with-deps chromium

# Unit tests
npm install --save-dev vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom @vitest/coverage-v8
```

**Config files to create:**
- `playwright.config.ts` — E2E config (baseURL: http://localhost:3000, headless, retries in CI)
- `vitest.config.ts` — Unit test config (jsdom environment, React plugin)

**E2E Architecture (Page Object Model):**
- One Page Object class per page/feature
- Page objects in `tests/e2e/page-objects/`
- E2E test files in `tests/e2e/`
- Follow the POM structure in your specs

**Test Scripts to add to package.json:**
```json
{
  "test": "vitest",
  "test:e2e": "playwright test",
  "test:e2e:ui": "playwright test --ui",
  "test:coverage": "vitest --coverage"
}
```

### Step 5 — Sync Specs with Code
After each feature's implementation:
- Update the spec to reflect the approved implementation
- Keep specs and code in sync (SDD principle)
- Commit specs and tests together

---

## Code Standards for Tests

Follow `CODING_STANDARDS.md`. Key points for test code:
- TypeScript everywhere — no `any`
- camelCase for functions/variables, PascalCase for classes/interfaces
- Descriptive test names that read like sentences: `"should redirect to dashboard after successful login"`
- Arrange-Act-Assert structure in every test
- No hardcoded credentials — use a `.env.test` file or test fixtures
- Page Objects: one file per page, constructor accepts `Page` from Playwright

---

## SDD Framework Reference

`sdd-framework/` is a **git submodule** pointing to the reusable SDD template repo.

> **Do not modify files inside `sdd-framework/`** — it's a shared template used across projects.
> To update to the latest template version: `git submodule update --remote sdd-framework`

| Document | Purpose |
|----------|---------|
| `sdd-framework/specs/META-FRAMEWORK.md` | Complete SDD workflow — read this first |
| `sdd-framework/specs/PROJECT-SPEC.template.md` | Template to create your PROJECT-SPEC.md |
| `sdd-framework/specs/PROJECT-SPEC.csharp-example.md` | Real filled-out example for reference |
| `sdd-framework/specs/templates/` | Spec templates for each artifact type |
| `sdd-framework/specs/examples/` | Complete C# example specs (6 features) |
| `sdd-framework/docs/agent-patterns.md` | AI prompts for spec/code generation |
| `sdd-framework/docs/test-architecture-spec.md` | Architecture patterns and anti-patterns |
| `sdd-framework/docs/retrospective-parallel-tests.md` | Real lessons from C# implementation |
