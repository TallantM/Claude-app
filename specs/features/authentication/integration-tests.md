# Authentication — Integration Test Specification

## Test Suite Overview

**Test File**: `tests/e2e/authentication.spec.ts` (focused integration scenarios)
**What We're Testing**: Login and Register Page Objects working with a real browser against
the running application. Single-feature scope — no multi-page workflows here.
**Test Type**: Integration Tests (Playwright, real browser)
**Framework**: `test.describe("Authentication - Integration", () => { ... })`

---

## Test Configuration

**Browser**: Chromium (headless)
**Base URL**: `http://localhost:3000`
**Prerequisite**: App running with seeded test database
**Test Data**: Credentials from `.env.test`
- Valid user: `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`
- Non-existent user: `nonexistent@example.com` / `anypassword`

---

## Test Scenarios: Login Page Object Integration

### Scenario: Login page loads and shows expected elements

**Given**: Browser navigates to `/login`
**When**: Page has loaded
**Then**:
- Page URL is `/login`
- Heading "Welcome back" is visible
- Email input is visible and empty
- Password input is visible and empty
- "Sign in" button is visible

**Severity**: Normal
**Tags**: Smoke, Render

---

### Scenario: Successful login with valid credentials navigates to dashboard

**Given**: Browser is on `/login`
**When**: Valid email and password are entered and form submitted
**Then**:
- Page URL changes to `/dashboard`
- The Dashboard heading is visible

**Severity**: Critical
**Tags**: Smoke, Auth

---

### Scenario: Failed login with invalid credentials shows error message

**Given**: Browser is on `/login`
**When**: Non-existent email and any password are entered and form submitted
**Then**:
- Page URL remains `/login`
- `[role="alert"]` is visible
- Alert contains "Invalid email or password"

**Severity**: Critical
**Tags**: Smoke, Negative, Auth

---

### Scenario: Empty form submission shows validation feedback

**Given**: Browser is on `/login`
**When**: The submit button is clicked without entering any data
**Then**:
- Page does not navigate away (stays on `/login`)
- Form field validation feedback is shown (browser or inline)

**Severity**: Normal
**Tags**: Regression, Validation

---

### Scenario: Register link navigates to registration page

**Given**: Browser is on `/login`
**When**: The "Sign up" link is clicked
**Then**:
- Page URL changes to `/register`
- Heading "Create an account" is visible

**Severity**: Normal
**Tags**: Regression, Navigation

---

## Test Scenarios: Register Page Object Integration

### Scenario: Register page loads with all expected fields

**Given**: Browser navigates to `/register`
**When**: Page has loaded
**Then**:
- URL is `/register`
- Full Name, Email, Password, Confirm Password inputs are visible
- "Create account" button is visible

**Severity**: Normal
**Tags**: Smoke, Render

---

### Scenario: Successful registration redirects to login with success signal

**Given**: Browser is on `/register`
**When**: Valid unique name, email, and matching passwords are submitted
**Then**:
- Page URL changes to `/login` (with or without `?registered=true`)
- Login page is displayed

**Severity**: Critical
**Tags**: Smoke, Auth

---

### Scenario: Duplicate email registration shows error

**Given**: Browser is on `/register` and the test user's email already exists in the DB
**When**: The same email is submitted with any valid name and password
**Then**:
- Page stays on `/register`
- `[role="alert"]` is visible
- Alert contains a message about the email already being registered

**Severity**: Normal
**Tags**: Regression, Negative

---

### Scenario: Mismatched passwords show validation feedback

**Given**: Browser is on `/register`
**When**: Different values are entered for password and confirmPassword
**Then**:
- Form does not submit
- Validation error is shown for the confirm password field

**Severity**: Normal
**Tags**: Regression, Validation

---

## Notes

- These tests require the app to be running (`npm run dev` or test server).
- Registration tests create real users in the database — use unique email addresses
  (e.g., `Date.now()` suffix) to avoid conflicts between test runs.
- Consider running integration tests in a separate project with a fresh DB.
