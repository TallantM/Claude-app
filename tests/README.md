# Tests

This directory contains the test suite for sdlc-hub, implemented following the **Spec-Driven Development (SDD)** methodology.

See `CLAUDE.md` for setup instructions and `sdd-framework/` for the SDD process documentation.

## Structure

```
tests/
├── e2e/              # Playwright E2E browser tests
│   └── page-objects/ # Page Object Model classes (one per page)
└── unit/             # Vitest + React Testing Library unit tests
```

## Running Tests

```bash
# Unit tests
npm test

# E2E tests (requires app running: npm run dev)
npm run test:e2e

# E2E with interactive UI
npm run test:e2e:ui

# Coverage report
npm run test:coverage
```

## Specs

Feature specs live in `specs/features/` — read those before reading the tests.
The specs define *what* the tests verify; the tests are the implementation.
