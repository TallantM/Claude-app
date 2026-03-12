# CLAUDE.md — SDD Engagement Instructions

## Project Overview

**App**: sdlc-hub — A software development lifecycle hub for managing projects, issues, pipelines, repos, team, and reports
**Stack**: Next.js 14, TypeScript, Prisma, NextAuth v4, Vitest, Playwright
**Repo**: github.com/TallantM/Claude-app
**Working Branch**: experiment/run-2

---

## SDD Methodology

This project uses **Spec-Driven Development (SDD)**. The workflow is:

```
1. Specs first       → Write specs in specs/features/{feature}/
2. Review specs      → Human reviews before any code is written
3. Generate tests    → Agent implements tests from specs
4. Validate          → Run conformance + unit + E2E tests
5. Commit together   → Specs and tests in the same commit
```

**Specs are the source of truth.** Code is derived from specs. If code and specs diverge, update the spec first, then the code.

### SDD Agent Reference

- **Spec Generation Agent prompt**: `sdd-framework/docs/agent-patterns.md` → Pattern 1
- **Code Generation Agent prompt** (TypeScript): `sdd-framework/docs/agent-patterns.md` → Pattern 2b
- **Conformance test template**: `sdd-framework/specs/templates/conformance-test.vitest.template.ts`

---

## Application Architecture

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Auth | NextAuth v4 (credentials provider) |
| Database | Prisma ORM → SQLite (dev/test) |
| Styling | Tailwind CSS + shadcn/ui |
| Unit Tests | Vitest + React Testing Library + jsdom |
| E2E Tests | Playwright (Chromium, headless) |
| Reporting | Allure (via allure-playwright) |
| CI | GitHub Actions |

### Protected Routes

All routes under `src/app/(app)` require authentication. Each must have a matching `specs/features/{feature}/` directory.

### Test Directory Structure

```
tests/
├── unit/          ← Vitest + React Testing Library (fast, no browser)
├── e2e/           ← Playwright (real browser, seeded DB)
│   └── page-objects/
└── conformance/   ← Spec-code alignment validation (Vitest, no browser)
```

---

## Feature Inventory

Before writing any specs or tests, list all features that need coverage:

| Feature | Route | Spec Directory | Status |
|---------|-------|----------------|--------|
| Authentication | `/login`, `/register` | `specs/features/authentication/` | ☐ specced ☐ tested |
| Dashboard | `/dashboard` | `specs/features/dashboard/` | ☐ specced ☐ tested |
| Issues | `/issues` | `specs/features/issues/` | ☐ specced ☐ tested |
| Projects | `/projects` | `specs/features/projects/` | ☐ specced ☐ tested |
| Project Detail | `/projects/[id]` | `specs/features/project-detail/` | ☐ specced ☐ tested |
| Notifications | `/notifications` | `specs/features/notifications/` | ☐ specced ☐ tested |
| Pipelines | `/pipelines` | `specs/features/pipelines/` | ☐ specced ☐ tested |
| Reports | `/reports` | `specs/features/reports/` | ☐ specced ☐ tested |
| Repos | `/repos` | `specs/features/repos/` | ☐ specced ☐ tested |
| Settings | `/settings` | `specs/features/settings/` | ☐ specced ☐ tested |
| Team | `/team` | `specs/features/team/` | ☐ specced ☐ tested |

**Rule**: Every protected app route must have a spec directory. The conformance test enforces this and will fail CI if any route is unspecced.

**Note on project-detail**: The dynamic route `[id]` maps to spec name `project-detail`. Add `"projects/[id]": "project-detail"` to `APP_FEATURE_NAME_MAP` in the conformance test.

---

## Test Patterns

### Unit Tests (Vitest + React Testing Library)

```typescript
// Mock fetch before rendering
vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
  ok: true,
  json: async () => MOCK_RESPONSE,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/{route}",
}));

// AAA pattern
it("should {description}", async () => {
  // Arrange
  // Act
  render(<ComponentPage />);
  // Assert
  await waitFor(() => expect(screen.getByText("...")).toBeInTheDocument());
});
```

### E2E Tests (Playwright)

```typescript
// All authenticated tests use saved auth state
test.use({ storageState: ".auth/user.json" });

// Use Page Objects — never call page.locator() directly in tests
const featurePage = new FeaturePage(page);
await featurePage.navigate();
await featurePage.performAction();
await expect(featurePage.getResultLocator()).toBeVisible();
```

### Known Locator Gotcha

**Dev toolbar `role="alert"`**: Next.js dev mode injects an empty `role="alert"` element into the DOM. Never use a bare `[role="alert"]` locator — it will match the toolbar element. Always scope:

```typescript
// WRONG — matches Next.js dev toolbar
page.locator('[role="alert"]')

// CORRECT — scoped to the error display class
page.locator('.text-destructive[role="alert"]')
```

### Page Objects

```typescript
export class {Feature}Page {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto("/{route}");
  }
}
```

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm test` | Run unit tests |
| `npm run test:conformance` | Run spec-code conformance validation |
| `npm run test:e2e` | Run E2E tests (requires running app + seeded DB) |
| `npm run test:coverage` | Run unit tests with coverage report |
| `npm run db:seed` | Seed test database |

---

## Known App-Level Issues

These are bugs in the app, not the test framework. You will likely encounter them:

1. **No `src/middleware.ts`**: Auth guard was never implemented. You must create it:
   ```typescript
   export { default } from "next-auth/middleware";
   export const config = {
     matcher: ["/dashboard/:path*", "/issues/:path*", "/projects/:path*",
               "/notifications/:path*", "/pipelines/:path*", "/reports/:path*",
               "/repos/:path*", "/settings/:path*", "/team/:path*"],
   };
   ```
   File must be at `src/middleware.ts` (not project root).

2. **Dashboard API 500**: `/api/dashboard` may throw if Activity model has schema mismatch. Check `prisma/schema.prisma` before writing dashboard E2E tests.

3. **SQLite concurrency**: `workers: 1`, `fullyParallel: false` required in `playwright.config.ts`. Do not change this without switching to PostgreSQL.

---

## Definition of Done

An engagement is complete when ALL of the following are true.

### Spec Completeness
- [ ] Every protected route has a `specs/features/{feature}/` directory
- [ ] Every spec directory has all 4 spec files (page-objects, unit-tests, integration-tests, workflows)
- [ ] All scenarios in `unit-tests.md` use numbered list format (`1. **name**`)
- [ ] All workflows in `workflows.md` use numbered list format (`1. **name**`)

### Test Implementation
- [ ] Each spec feature has `tests/unit/{feature}-page.test.tsx`
- [ ] Each spec feature has `tests/e2e/{feature}.spec.ts`
- [ ] Each spec feature has `tests/e2e/page-objects/{feature}.page.ts`

### All Tests Pass
- [ ] `npm test` — all unit tests pass
- [ ] `npm run test:conformance` — all conformance tests pass (hard fail, no warnings)
- [ ] `npm run db:seed && npm run test:e2e` — all E2E tests pass
- [ ] `npm run test:coverage` — all coverage thresholds met

### Infrastructure
- [ ] `.env.test.example` committed and documents all required variables
- [ ] `.github/workflows/ci.yml` runs unit, conformance, and E2E jobs
- [ ] CI passes on first push to the working branch

---

## Final Audit (Required — do not skip)

Before declaring the engagement complete, walk through every spec scenario:

For each feature in `specs/features/`:
1. Open `unit-tests.md` — count numbered scenarios (`grep -c "^\d\." unit-tests.md`)
2. Open the corresponding unit test file — count `it(` calls
3. If test count < scenario count: write the missing tests now
4. Open `workflows.md` — count numbered workflows
5. Open the corresponding `.spec.ts` — count `test(` calls
6. If E2E count < workflow count: write the missing tests now

This step is not optional. The conformance test enforces it mechanically, but this manual walkthrough catches edge cases the automated count misses.

---

## Commit Integrity

Before writing a commit message that claims tests pass, run the full test suite **after your last change**:

```bash
npm test
npm run test:conformance
npm run test:e2e
```

Rules:
- **Run after your final change** — not after each individual step
- **Atomic commits** — app code changes that break existing tests must be committed in the same commit as the test fix
- **CI is not a substitute** — your commit message reflects what you confirmed locally

---

## Environment Variables

| Variable | Description | Required For |
|----------|-------------|-------------|
| `TEST_USER_EMAIL` | E2E test user email | E2E tests |
| `TEST_USER_PASSWORD` | E2E test user password | E2E tests |
| `BASE_URL` | App URL | E2E tests |
| `NEXTAUTH_SECRET` | Auth signing secret | App + E2E |
| `DATABASE_URL` | Database connection | App + Seed |

Copy `.env.test.example` to `.env.test` before running E2E tests locally.
