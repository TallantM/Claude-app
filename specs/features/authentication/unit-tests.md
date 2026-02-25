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

1. **renders the login form with all expected elements**
   - Given: LoginPage is rendered with no user interaction
   - Then: email input, password input, "Sign in" button, GitHub + Google OAuth buttons, "Sign up" link, and no error alert are all visible

2. **submits credentials to signIn on form submission**
   - Given: email "user@example.com" and password "password123" are typed
   - When: "Sign in" button is clicked
   - Then: `signIn` is called with `"credentials"`, `email`, `password`, and `redirect: false`

3. **shows error message when signIn returns an error**
   - Given: `signIn` resolves with `{ error: "CredentialsSignin" }`
   - When: form is submitted
   - Then: `role="alert"` element with "Invalid email or password" is visible

4. **redirects to dashboard on successful login**
   - Given: `signIn` resolves with `{ error: null }`
   - When: form is submitted
   - Then: `router.push("/dashboard")` and `router.refresh()` are called

5. **disables submit button while login is in progress**
   - Given: `signIn` is a slow promise (not yet resolved)
   - When: form is submitted
   - Then: submit button is disabled and Loader2 spinner is visible inside it

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

1. **renders all registration form fields**
   - Given: RegisterPage is rendered with no interaction
   - Then: Full Name, Email, Password, Confirm Password inputs, "Create account" button, and "Sign in" link are all visible

2. **redirects to login after successful registration**
   - Given: `fetch` resolves with `{ ok: true }`
   - When: form filled with valid data and submitted
   - Then: `router.push("/login?registered=true")` is called

3. **shows error when API returns an error**
   - Given: `fetch` resolves with `{ ok: false, body: { error: "Email already exists" } }`
   - When: form is submitted
   - Then: `role="alert"` element with "Email already exists" is visible

---

## Notes

- React Hook Form validation (Zod) runs client-side before fetch — invalid email formats
  will show inline field errors rather than the global alert.
- Do not test Zod validation itself — that's covered by the validations unit.
- Focus on: render, submit behavior, error display, success navigation.
