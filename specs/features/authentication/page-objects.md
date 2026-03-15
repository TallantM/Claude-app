# Page Objects — authentication

## LoginPage

**URL**: `/login`
**File**: `tests/e2e/page-objects/login.page.ts`
**Class**: `LoginPage`

### Elements

| Element | Selector | Notes |
|---------|----------|-------|
| Email input | `#email` | type="email" |
| Password input | `#password` | type="password" |
| Submit button | `button[type="submit"]` | "Sign in" |
| Error alert | `[role="alert"]:not(#__next-route-announcer__)` | Pattern 1 disambiguation |
| GitHub button | `button:has-text("GitHub")` | OAuth |
| Google button | `button:has-text("Google")` | OAuth |
| Register link | `a[href="/register"]` | "Sign up" |
| Page heading | `h2:has-text("Welcome back")` | Card heading |

### Methods

- `navigate(): Promise<void>` — goto `/login`, wait for `button[type="submit"]`
- `login(email: string, password: string): Promise<void>` — fill inputs and click submit
- `getErrorMessage(): Promise<string | null>` — return alert text or null
- `isErrorVisible(): Promise<boolean>` — check alert visibility
- `clickRegisterLink(): Promise<void>` — click `a[href="/register"]`

---

## RegisterPage

**URL**: `/register`
**File**: `tests/e2e/page-objects/register.page.ts`
**Class**: `RegisterPage`

### Elements

| Element | Selector | Notes |
|---------|----------|-------|
| Name input | `#name` | Full name |
| Email input | `#email` | type="email" |
| Password input | `#password` | type="password" |
| Confirm password | `#confirmPassword` | type="password" |
| Submit button | `button[type="submit"]` | "Create account" |
| Error alert | `[role="alert"]:not(#__next-route-announcer__)` | Pattern 1 disambiguation |
| Login link | `a[href="/login"]` | "Sign in" |

### Methods

- `navigate(): Promise<void>` — goto `/register`, wait for `button[type="submit"]`
- `register(name, email, password, confirmPassword): Promise<void>` — fill all fields and submit
- `getErrorMessage(): Promise<string | null>` — return alert text or null
- `clickLoginLink(): Promise<void>` — click `a[href="/login"]`
