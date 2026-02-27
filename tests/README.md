# Tests

This directory contains the test suite for sdlc-hub, implemented following the **Spec-Driven Development (SDD)** methodology.

See `CLAUDE.md` for setup instructions and `sdd-framework/` for the SDD process documentation.

## Structure

```
tests/
├── e2e/
│   ├── .auth/              # Saved auth state (git-ignored)
│   ├── page-objects/       # Page Object Model classes (one per page)
│   │   ├── login.page.ts
│   │   ├── register.page.ts
│   │   ├── projects.page.ts
│   │   ├── issues.page.ts
│   │   └── dashboard.page.ts
│   ├── auth.setup.ts       # Saves auth session for authenticated tests
│   ├── authentication.spec.ts
│   ├── projects.spec.ts
│   ├── issues.spec.ts
│   └── dashboard.spec.ts
└── unit/
    ├── setup.ts             # Global test setup (jest-dom, nav mocks)
    ├── login-page.test.tsx
    ├── register-page.test.tsx
    ├── projects-page.test.tsx
    ├── issues-page.test.tsx
    └── dashboard-page.test.tsx
```

## Test Counts

- **Unit tests**: 28 tests across 5 files (login, register, projects, issues, dashboard)
- **E2E tests**: ~24 tests across 4 files (auth, projects, issues, dashboard)

## Setup

1. Copy `.env.test` from `.env.test.example` (or use the provided defaults for local dev)
2. Seed the database: `npm run db:seed`
3. For E2E tests, the app auto-starts via `webServer` in `playwright.config.ts`

## Running Tests

```bash
# Unit tests (no app required)
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests — all (auth setup + authenticated tests)
npm run test:e2e

# E2E authentication flows only (login/register)
npm run test:e2e:auth

# E2E with interactive Playwright UI
npm run test:e2e:ui
```

## Prerequisites for E2E Tests

- Database seeded: `npm run db:seed`
- `.env.test` with valid test user credentials (matches seeded user)
- First run creates `tests/e2e/.auth/user.json` (git-ignored)

## Specs

Feature specs live in `specs/features/` — read those before reading the tests.
The specs define *what* the tests verify; the tests are the implementation.
