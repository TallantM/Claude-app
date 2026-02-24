# Authentication — End-to-End Workflow Specification

## Test Suite Overview

**Test File**: `tests/e2e/authentication.spec.ts`
**What We're Testing**: Complete authentication user journeys
**Test Type**: End-to-End Tests (Playwright, real browser)
**Framework**: `test.describe("Authentication", () => { ... })`

### Purpose
Test complete authentication flows from a user's perspective: logging in successfully,
handling bad credentials gracefully, registering a new account, and verifying that
protected routes redirect unauthenticated users to login.

---

## Test Configuration

**Browser**: Chromium (headless in CI, headed for debugging)
**Base URL**: `http://localhost:3000`
**Test Users**: From `.env.test` (valid existing user + unique email generator for registration)
**Prerequisite**: Running app + seeded DB with at least one user

---

## Workflow Scenarios

### Workflow: Successful login and access to protected area

**User Story**: As a registered user, I want to log in with my email and password so that
I can access the SDLC Hub dashboard.

**Steps**:
1. Navigate to `/login`
2. Enter valid email from `TEST_USER_EMAIL`
3. Enter valid password from `TEST_USER_PASSWORD`
4. Click the "Sign in" button
5. Verify redirect to `/dashboard`
6. Verify "Dashboard" heading is visible

**Expected Outcome**:
- URL is `/dashboard`
- Dashboard content is rendered (heading "Dashboard" is visible)

**Severity**: Critical
**Tags**: Smoke, Auth, Login

---

### Workflow: Login failure with invalid credentials

**User Story**: As a user who types the wrong password, I want to see a clear error message
so that I know my login failed.

**Steps**:
1. Navigate to `/login`
2. Enter `nonexistent@example.com` as email
3. Enter `wrongpassword` as password
4. Click "Sign in"
5. Verify error alert appears
6. Verify URL remains `/login`

**Expected Outcome**:
- Error alert with "Invalid email or password" is visible
- User is still on `/login`
- Form is still shown (can retry)

**Severity**: Critical
**Tags**: Smoke, Auth, Negative

---

### Workflow: Unauthenticated user redirected to login

**User Story**: As a visitor without a session, I want to be redirected to the login page
when I try to access a protected route.

**Steps**:
1. Navigate directly to `/dashboard` without being logged in
2. Verify redirect to `/login`
3. Verify login page is displayed

**Expected Outcome**:
- URL ends at `/login` (possibly with `?callbackUrl=...` param)
- Login form is visible

**Severity**: Critical
**Tags**: Smoke, Auth, Security

---

### Workflow: New user registration and login

**User Story**: As a new user, I want to create an account so that I can start using SDLC Hub.

**Steps**:
1. Navigate to `/register`
2. Enter a unique name (e.g., "Test User")
3. Enter a unique email (e.g., `test-{timestamp}@example.com`)
4. Enter a valid password (8+ characters)
5. Enter matching confirm password
6. Click "Create account"
7. Verify redirect to `/login`
8. Log in with the newly created credentials
9. Verify redirect to `/dashboard`

**Expected Outcome**:
- After registration: URL is `/login`
- After login: URL is `/dashboard`
- Dashboard content is visible

**Severity**: Critical
**Tags**: Smoke, Auth, Registration

---

### Workflow: Login page shows register link; register page shows login link

**User Story**: As a user on the wrong auth page, I want easy navigation to the other form.

**Steps**:
1. Navigate to `/login`
2. Click "Sign up" link
3. Verify URL is `/register`
4. Click "Sign in" link
5. Verify URL is `/login`

**Expected Outcome**:
- Navigation between auth pages works bidirectionally

**Severity**: Normal
**Tags**: Regression, Navigation

---

## Coverage

**What's covered**:
- Successful login → dashboard access
- Failed login → error message shown
- Unauthenticated access to protected route → redirect to login
- New user registration → redirect to login → successful login
- Auth page cross-navigation

**Scenarios Tested**:
- ✅ Happy path login
- ✅ Invalid credentials error
- ✅ Auth guard / redirect
- ✅ Full registration flow
- ✅ Cross-navigation between auth pages

---

## Notes

**External Dependency**: Running Next.js app on port 3000 with SQLite DB
**Test Data**: Seeded user in DB for login tests; unique timestamp email for registration
**Auth State**: Tests in this file do NOT use saved auth state — they test auth itself
