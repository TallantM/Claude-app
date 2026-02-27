# Dashboard — Integration Test Specification

## Test Suite Overview

**Test File**: `tests/e2e/dashboard.spec.ts` (focused integration scenarios)
**What We're Testing**: DashboardPage Page Object with real browser + running app
**Test Type**: Integration Tests (Playwright, authenticated session)
**Framework**: `test.describe("Dashboard - Integration", () => { ... })`

---

## Test Configuration

**Browser**: Chromium (headless)
**Base URL**: `http://localhost:3000`
**Auth**: Saved auth state from `tests/e2e/.auth/user.json`
**Prerequisite**: App running + DB seeded with projects, tasks, issues, sprints, team members

---

## Test Scenarios

### Scenario: Dashboard page loads successfully

**Given**: Authenticated user navigates to `/dashboard`
**When**: Page has loaded
**Then**:
- URL is `/dashboard`
- "Dashboard" heading is visible
- Loading skeleton disappears
- Stat cards are visible (six cards in the grid)

**Severity**: Critical
**Tags**: Smoke, Render

---

### Scenario: All six stat cards are visible with numeric values

**Given**: Authenticated user is on `/dashboard` with seeded DB data
**When**: Page has loaded
**Then**:
- "Total Projects" card is visible and shows a number > 0
- "Total Tasks" card is visible and shows a number
- "Completed Tasks" card is visible and shows a number
- "Open Issues" card is visible and shows a number
- "Active Sprints" card is visible and shows a number
- "Team Members" card is visible and shows a number

**Severity**: Critical
**Tags**: Smoke, Stats

---

### Scenario: Recent Activity section is visible

**Given**: Authenticated user is on `/dashboard` with recent activity in DB
**When**: Page has loaded
**Then**:
- "Recent Activity" card heading is visible
- At least one activity entry is visible in the feed

**Severity**: Normal
**Tags**: Regression, Activity

---

### Scenario: Task Distribution section is visible

**Given**: Authenticated user is on `/dashboard`
**When**: Page has loaded
**Then**:
- "Task Distribution" card heading is visible
- Status labels (To Do, In Progress, In Review, Done) are visible
- "Total Tasks" count is shown in the summary

**Severity**: Normal
**Tags**: Regression, Chart

---

### Scenario: Dashboard is accessible only when authenticated

**Given**: A fresh browser context with no auth state
**When**: User navigates to `/dashboard`
**Then**:
- User is redirected to `/login`
- Dashboard content is not visible

**Severity**: Critical
**Tags**: Smoke, Auth, Security

---

## Notes

- Seeded DB should include at least one project, task, issue, sprint, and team member
  so that stat cards show non-zero values.
- The dashboard doesn't paginate or filter — just loads and renders.
- No interactions to test beyond navigation and visibility — it's a read-only page.
