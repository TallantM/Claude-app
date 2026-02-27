# Dashboard — End-to-End Workflow Specification

## Test Suite Overview

**Test File**: `tests/e2e/dashboard.spec.ts`
**What We're Testing**: Dashboard page user journeys
**Test Type**: End-to-End Tests (Playwright, authenticated)
**Framework**: `test.describe("Dashboard", () => { ... })`

---

## Test Configuration

**Browser**: Chromium (headless)
**Base URL**: `http://localhost:3000`
**Auth**: Saved auth state from `tests/e2e/.auth/user.json`
**Prerequisite**: Running app + seeded DB with all entity types

---

## Workflow Scenarios

### Workflow: Authenticated user views the dashboard

**User Story**: As a signed-in team member, I want to see the SDLC Hub dashboard so that
I can get a quick overview of my projects, tasks, and team activity.

**Steps**:
1. Navigate to `/dashboard` (authenticated)
2. Wait for loading to finish (skeleton disappears)
3. Verify "Dashboard" heading is visible
4. Verify all six stat cards are rendered (Total Projects, Total Tasks, Completed Tasks,
   Open Issues, Active Sprints, Team Members)
5. Verify each stat card shows a numeric value
6. Verify "Recent Activity" section is visible
7. Verify "Task Distribution" section is visible with status labels

**Expected Outcome**:
- All six stat cards rendered with real values from DB
- Activity feed shows up to 10 recent entries
- Task distribution section shows To Do / In Progress / In Review / Done bars

**Severity**: Critical
**Tags**: Smoke, Dashboard

---

### Workflow: Dashboard is the default destination after login

**User Story**: As a user who just logged in, I expect to land on the dashboard automatically.

**Steps**:
1. Navigate to `/login` (no auth)
2. Enter valid credentials
3. Click "Sign in"
4. Verify redirect to `/dashboard`
5. Verify dashboard heading and stat cards are visible

**Expected Outcome**:
- After login, URL is `/dashboard`
- Dashboard content loaded

**Severity**: Critical
**Tags**: Smoke, Auth, Dashboard

---

### Workflow: Unauthenticated user cannot access the dashboard

**User Story**: As a security requirement, unauthenticated visitors must be redirected away
from the dashboard.

**Steps**:
1. Open fresh browser context (no saved auth)
2. Navigate to `/dashboard`
3. Verify redirect to `/login`
4. Verify login page is shown

**Expected Outcome**:
- URL contains `/login`
- Dashboard content is NOT visible

**Severity**: Critical
**Tags**: Smoke, Auth, Security

---

### Workflow: Sidebar navigation to dashboard from another page

**User Story**: As a user on the projects page, I want to click "Dashboard" in the sidebar
to navigate back to the overview.

**Steps**:
1. Navigate to `/projects` (authenticated)
2. Click the "Dashboard" link in the sidebar navigation
3. Verify URL changes to `/dashboard`
4. Verify "Dashboard" heading is visible

**Expected Outcome**:
- URL is `/dashboard`
- Dashboard content is loaded

**Severity**: Normal
**Tags**: Regression, Navigation

---

## Coverage

**What's covered**:
- Full dashboard render (all stat cards, activity feed, task distribution)
- Dashboard as post-login destination
- Auth guard (unauthenticated redirect)
- Sidebar navigation to dashboard

**Scenarios Tested**:
- ✅ Dashboard render for authenticated user
- ✅ Dashboard as login redirect destination
- ✅ Unauthenticated redirect to login
- ✅ Sidebar navigation to dashboard

---

## Notes

**Test Data**: All stat cards require corresponding seeded entities in the DB.
**Read-only**: Dashboard has no create/edit interactions — only navigation and visibility tests.
**Sidebar**: Assumes sidebar is visible and has a "Dashboard" link (from the Header/Sidebar component).
