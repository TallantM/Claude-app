# Authentication — Unit Test Specification

## Test Suite Overview

**Test File**: `tests/unit/login-page.test.tsx`
**What We're Testing**: LoginPage React component behavior in isolation
**Test Type**: Unit Tests (Vitest + React Testing Library)
**Framework**: `describe("LoginPage", () => { ... })`

### Purpose
Validate that the LoginPage component renders correctly, handles user input,
calls `signIn` with the right arguments, shows errors on failure, and
navigates on success — all without a real browser or server.

---

## Test Configuration

**Environment**: jsdom (simulated browser)
**Mocks Required**:
- `next-auth/react` → mock `signIn` function
- `next/navigation` → mock `useRouter` (provide `{ push: vi.fn(), refresh: vi.fn() }`)

---

## Test Scenarios: LoginPage

### Scenario: Renders the login form

**Given**: The LoginPage component is rendered
**When**: No user interaction has occurred
**Then**:
- An email input is visible (labeled "Email")
- A password input is visible (labeled "Password")
- A submit button reading "Sign in" is visible
- GitHub and Google OAuth buttons are visible
- A "Sign up" link to `/register` is visible
- No error alert is visible

**Severity**: Normal
**Tags**: Smoke, Render

---

### Scenario: Submits credentials to signIn on form submission

**Given**: Email "user@example.com" and password "password123" are typed
**When**: The "Sign in" button is clicked
**Then**:
- `signIn` is called with `"credentials"` as the provider
- The `email` option is `"user@example.com"`
- The `password` option is `"password123"`
- The `redirect` option is `false`

**Severity**: Critical
**Tags**: Smoke, Auth

---

### Scenario: Shows error message when signIn returns an error

**Given**: `signIn` resolves with `{ error: "CredentialsSignin" }`
**When**: The form is submitted with any credentials
**Then**:
- An element with `role="alert"` is visible
- It contains the text "Invalid email or password"

**Severity**: Critical
**Tags**: Regression, Error Handling

---

### Scenario: Redirects to dashboard on successful login

**Given**: `signIn` resolves with `{ error: null }` (no error)
**When**: The form is submitted
**Then**:
- `router.push` is called with `"/dashboard"`
- `router.refresh` is called

**Severity**: Critical
**Tags**: Smoke, Navigation

---

### Scenario: Disables submit button while loading

**Given**: `signIn` is a slow promise (not yet resolved)
**When**: The form is submitted
**Then**:
- The submit button is disabled during the pending call
- A loading spinner (Loader2 icon) is visible inside the button

**Severity**: Normal
**Tags**: Regression, UX

---

## Test Suite Overview

**Test File**: `tests/unit/register-page.test.tsx`
**What We're Testing**: RegisterPage React component
**Framework**: `describe("RegisterPage", () => { ... })`

### Mocks Required
- `next/navigation` → mock `useRouter`
- `global.fetch` → mock the `/api/auth/register` POST request

---

## Test Scenarios: RegisterPage

### Scenario: Renders all registration form fields

**Given**: The RegisterPage component is rendered
**When**: No interaction
**Then**:
- Full Name, Email, Password, and Confirm Password inputs are visible
- A "Create account" submit button is visible
- A "Sign in" link to `/login` is visible

**Severity**: Normal
**Tags**: Smoke, Render

---

### Scenario: Redirects to login after successful registration

**Given**: `fetch` resolves with `{ ok: true }`
**When**: The form is filled with valid data and submitted
**Then**:
- `router.push` is called with `"/login?registered=true"`

**Severity**: Critical
**Tags**: Smoke, Navigation

---

### Scenario: Shows error when API returns an error

**Given**: `fetch` resolves with `{ ok: false, body: { error: "Email already exists" } }`
**When**: The form is submitted
**Then**:
- An element with `role="alert"` is visible
- It contains the text "Email already exists"

**Severity**: Critical
**Tags**: Regression, Error Handling

---

## Notes

- React Hook Form validation (Zod) runs client-side before fetch — invalid email formats
  will show inline field errors rather than the global alert.
- Do not test Zod validation itself — that's covered by the validations unit.
- Focus on: render, submit behavior, error display, success navigation.
