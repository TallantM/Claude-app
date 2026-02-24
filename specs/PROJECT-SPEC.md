# SDLC Hub — Test Automation Project Specification

## System Purpose

Automated test suite for SDLC Hub, a Software Development Lifecycle management platform. Tests validate
authentication, project management, issue tracking, and dashboard features using a full test pyramid:
unit tests for components, and end-to-end tests for complete user flows.

**Primary Goals**:
- Validate critical user flows through browser automation (login, register, project/issue management)
- Provide fast feedback through layered testing (unit → E2E)
- Run reliably in CI/CD pipelines (headless Chromium, no flakiness)
- Maintain clean, scalable test architecture (Page Object Model)
- Document application behavior as living specification

---

## Architectural Constraints

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Runtime** | Node.js | 20+ | Modern JS features, LTS support |
| **Language** | TypeScript | 5.7 | Type safety across all test code |
| **Browser Automation** | Playwright | latest | Cross-browser E2E testing |
| **E2E Test Framework** | @playwright/test | latest | Test runner, fixtures, assertions |
| **Unit Test Framework** | Vitest | latest | Fast unit tests with ESM support |
| **Component Testing** | React Testing Library | latest | React component testing |
| **Code Coverage** | @vitest/coverage-v8 | latest | Coverage reporting |
| **JS DOM** | jsdom | latest | Browser DOM simulation for unit tests |

**Key devDependencies** (in `package.json`):
```json
{
  "@playwright/test": "latest",
  "vitest": "latest",
  "@vitejs/plugin-react": "latest",
  "@testing-library/react": "latest",
  "@testing-library/user-event": "latest",
  "jsdom": "latest",
  "@vitest/coverage-v8": "latest"
}
```

### Design Patterns

#### 1. Page Object Model (POM)

**Definition**: Encapsulate page interactions in reusable TypeScript classes, separating test logic
from UI implementation details.

**Structure**:
- **Location**: `tests/e2e/page-objects/`
- **Naming**: `{page-name}.page.ts` (e.g., `login.page.ts`, `projects.page.ts`)
- **Responsibility**: Single page or logical UI section
- **Constructor**: Accepts Playwright `Page` instance
- **Methods**: All async, return `Promise<void>` for actions, `Promise<T>` for queries
- **No Assertions**: Page Objects perform actions, tests perform assertions

**Example**:
```typescript
// tests/e2e/page-objects/login.page.ts
import { Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async navigateTo(): Promise<void> {
    await this.page.goto("/login");
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.fill("#email", email);
    await this.page.fill("#password", password);
    await this.page.click('button[type="submit"]');
  }

  async getErrorMessage(): Promise<string | null> {
    const alert = this.page.locator('[role="alert"]');
    if (await alert.isVisible()) return alert.textContent();
    return null;
  }
}
```

**Benefits**:
- Reusability across tests
- Single point of change when UI changes
- Tests read like business scenarios
- Easier maintenance

---

#### 2. Test Pyramid Architecture

```
         ╱╲
        ╱E2E╲         ← Few, slow, high confidence (Playwright)
       ╱──────╲
      ╱  Unit  ╲      ← Many, fast, component validation (Vitest + RTL)
     ╱──────────╲
```

**Layer 1: Unit Tests**
- **Purpose**: Validate React component rendering, state, and behavior in isolation
- **Speed**: Very fast (no browser, jsdom environment)
- **Tool**: Vitest + React Testing Library
- **Mocking**: `vi.fn()` and `vi.mock()` to mock `fetch`, next/navigation, next-auth
- **Location**: `tests/unit/`
- **Naming**: `{component-name}.test.tsx` (e.g., `login-page.test.tsx`)
- **Test Count Target**: 3–5 tests per component covering key behaviors

**Layer 2: End-to-End Tests**
- **Purpose**: Validate complete user workflows in a real browser
- **Speed**: Slower (real browser, full app running)
- **Scope**: Multiple Page Objects, multi-step user journeys
- **Location**: `tests/e2e/`
- **Naming**: `{feature}.spec.ts` (e.g., `authentication.spec.ts`, `projects.spec.ts`)
- **Test Count Target**: 3–6 tests per feature covering happy paths and key error scenarios

**Current Distribution**:
- Unit: ~16 tests
- E2E: ~20 tests
- **Total**: ~36 tests

---

#### 3. Playwright Fixture Pattern

**Definition**: Each test gets a fresh browser page, ensuring full isolation.

**Pattern** (via `playwright.config.ts`):
```typescript
use: {
  baseURL: "http://localhost:3000",
  trace: "on-first-retry",
  screenshot: "only-on-failure",
}
```

**Auth State Reuse** (for authenticated tests):
```typescript
// tests/e2e/auth.setup.ts
test("authenticate", async ({ page }) => {
  await page.goto("/login");
  await page.fill("#email", process.env.TEST_USER_EMAIL!);
  await page.fill("#password", process.env.TEST_USER_PASSWORD!);
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");
  await page.context().storageState({ path: "tests/e2e/.auth/user.json" });
});
```

**Benefits**:
- Test isolation (fresh page per test)
- Auth state saved once, reused across authenticated tests
- Screenshots on failure for debugging

---

#### 4. AAA Pattern (Arrange-Act-Assert)

**Definition**: Structure tests with three clear sections.

**E2E Example**:
```typescript
test("should redirect to dashboard after successful login", async ({ page }) => {
  // Arrange
  const loginPage = new LoginPage(page);
  await loginPage.navigateTo();

  // Act
  await loginPage.login("user@example.com", "password123");

  // Assert
  await expect(page).toHaveURL("/dashboard");
});
```

**Unit Example**:
```typescript
it("should show error message on failed login", async () => {
  // Arrange
  vi.mocked(signIn).mockResolvedValue({ error: "CredentialsSignin" });
  render(<LoginPage />);

  // Act
  await userEvent.type(screen.getByLabelText("Email"), "bad@example.com");
  await userEvent.type(screen.getByLabelText("Password"), "wrongpass");
  await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

  // Assert
  expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password");
});
```

---

## Cross-Cutting Invariants

### Code Standards

#### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| **Test files (E2E)** | kebab-case.spec.ts | `authentication.spec.ts` |
| **Test files (unit)** | kebab-case.test.tsx | `login-page.test.tsx` |
| **Page Object files** | kebab-case.page.ts | `login.page.ts` |
| **Page Object classes** | PascalCase + Page suffix | `LoginPage`, `ProjectsPage` |
| **Test descriptions** | Sentence case, "should ..." | `"should redirect to dashboard after login"` |
| **describe blocks** | Feature/component name | `"LoginPage"`, `"Authentication"` |
| **Variables** | camelCase | `loginPage`, `projectCard` |
| **Constants** | UPPER_SNAKE_CASE | `TEST_USER_EMAIL` |

#### TypeScript Requirements
- **Strict mode**: No `any` types — use proper types from Playwright and app
- **Explicit return types**: All Page Object methods have explicit return types
- **Import type**: Use `import type` when importing only types

#### Async/Await
- All Playwright operations use `await`
- All Page Object methods are `async`
- No `.then()` chains in test code — always `async/await`

---

### Test Standards

#### Test Structure (E2E)
```typescript
import { test, expect } from "@playwright/test";
import { LoginPage } from "./page-objects/login.page";

test.describe("Authentication", () => {
  test("should redirect to dashboard after successful login", async ({ page }) => {
    // Arrange - Act - Assert
  });

  test("should show error on invalid credentials", async ({ page }) => {
    // ...
  });
});
```

#### Test Structure (Unit)
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the login form", () => {
    render(<LoginPage />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });
});
```

#### Assertions
- **Playwright assertions** (E2E): `expect(page).toHaveURL(...)`, `expect(locator).toBeVisible()`, `expect(locator).toHaveText(...)`
- **Vitest assertions** (unit): `expect(element).toBeInTheDocument()`, `expect(mockFn).toHaveBeenCalledWith(...)`
- **Error state**: Always verify error messages, not just absence of success

#### Test Isolation
- Each test is independent — no test depends on another
- E2E: Fresh browser page per test (Playwright default)
- Unit: `beforeEach(() => vi.clearAllMocks())` to reset mocks
- No shared mutable state between tests

#### Browser Configuration
- **CI**: Headless Chromium
- **Local**: Headless by default; `--headed` flag for debugging
- **Viewport**: 1280×720 (Playwright default)
- **Timeout**: 30s per test action, 60s per test

---

### Page Object Standards

#### Constructor
```typescript
constructor(private readonly page: Page) {}
```

#### Selectors (Priority Order)
1. **Semantic HTML / ARIA roles** (best): `page.getByRole("button", { name: "Sign in" })`
2. **HTML id attributes** (stable): `page.locator("#email")`
3. **Placeholder text**: `page.getByPlaceholder("Search projects...")`
4. **Headings/labels**: `page.getByLabel("Email")`
5. **CSS selectors** (last resort): `page.locator(".error-message")`

No data-test attributes are present in the current codebase — use semantic/id selectors.

#### No Assertions in Page Objects
Page Objects return data; tests assert on it.

```typescript
// ✅ Correct
const error = await loginPage.getErrorMessage();
expect(error).toContain("Invalid email or password");

// ❌ Incorrect
await loginPage.login("bad", "creds"); // Page Object should not assert
```

---

## Quality Gates

### Test Execution
- All tests must pass before merge
- No test may flake (retry budget: 2 retries in CI)
- E2E tests require running app on localhost:3000

### CI/CD Requirements
- App must be started before E2E tests run
- Unit tests run without app (pure jsdom)
- E2E tests run in headless Chromium

### Coverage Target
- Unit test coverage: 70%+ for tested components

---

## External Dependencies

### Application Under Test
- **Target**: http://localhost:3000 (local dev server)
- **Auth**: Email/password credentials from `.env.test`
- **Database**: SQLite test database (seeded before tests)

### Test Environment
- **`.env.test`**: Test credentials (not committed to git)
  ```
  TEST_USER_EMAIL=test@example.com
  TEST_USER_PASSWORD=testpassword123
  TEST_USER_NAME=Test User
  ```

---

## Security Standards

1. **No hardcoded credentials**: Test credentials in `.env.test`, never in code
2. **Auth state files**: `tests/e2e/.auth/` excluded from git
3. **No secrets in screenshots**: Ensure failure screenshots don't capture sensitive data

---

## Error Handling

### Test Failures
- **E2E**: Playwright captures screenshot + trace on failure
- **Unit**: Vitest shows component output + diff on assertion failure
- **Timeout**: Tests fail with timeout error; increase only if justified

### Retry Strategy
- CI: 2 retries for E2E tests (handles transient flakiness)
- Local: 0 retries (fail fast for development)

---

## Configuration Files

| File | Purpose |
|------|---------|
| `playwright.config.ts` | E2E test configuration (baseURL, browser, retries) |
| `vitest.config.ts` | Unit test configuration (jsdom environment, React plugin) |
| `.env.test` | Test credentials (excluded from git) |
| `tests/e2e/.auth/user.json` | Saved auth state (excluded from git) |

---

**Last Updated**: 2026-02-23
**Stack**: TypeScript + Playwright + Vitest + React Testing Library
**Version**: 1.0.0
