# Issues — Integration Test Specification

## Test Suite Overview

**Test File**: `tests/e2e/issues.spec.ts` (focused integration scenarios)
**What We're Testing**: IssuesPage Page Object with real browser + running app
**Test Type**: Integration Tests (Playwright, authenticated session)
**Framework**: `test.describe("Issues - Integration", () => { ... })`

---

## Test Configuration

**Browser**: Chromium (headless)
**Base URL**: `http://localhost:3000`
**Auth**: Saved auth state from `tests/e2e/.auth/user.json`
**Prerequisite**: App running + DB seeded with multiple issues of different statuses/severities

---

## Test Scenarios

### Scenario: Issues page loads and shows list

**Given**: Authenticated user navigates to `/issues`
**When**: Page has loaded
**Then**:
- URL is `/issues`
- "Issues" heading is visible
- At least one issue row is visible (from seeded data)
- "New Issue" button is visible

**Severity**: Critical
**Tags**: Smoke, Render

---

### Scenario: Status filter narrows the issue list

**Given**: Authenticated user is on `/issues` with open and resolved issues in DB
**When**: "Open" is selected from the status filter
**Then**:
- Only issues with "open" status badge are shown
- After switching to "All Status", all issues appear again

**Severity**: Normal
**Tags**: Regression, Filter

---

### Scenario: Severity filter narrows the issue list

**Given**: Authenticated user is on `/issues` with issues of multiple severities
**When**: "Critical" is selected from the severity filter
**Then**:
- Only issues with "critical" severity badge are shown

**Severity**: Normal
**Tags**: Regression, Filter

---

### Scenario: Search filters by title text (client-side)

**Given**: Authenticated user is on `/issues` with multiple issues
**When**: A partial title is typed into the search input
**Then**:
- Only issues whose title contains the search term are visible

**Severity**: Normal
**Tags**: Regression, Search

---

### Scenario: New Issue button opens the create dialog

**Given**: Authenticated user is on `/issues`
**When**: "New Issue" button is clicked
**Then**:
- A dialog appears with "Report New Issue" title
- Title, Description, Type, Severity, Status, and Repro Steps fields are visible
- "Create Issue" button is in the dialog

**Severity**: Normal
**Tags**: Regression, Dialog

---

### Scenario: Creating an issue adds it to the list

**Given**: Create dialog is open
**When**: A unique title is entered and "Create Issue" is submitted
**Then**:
- Dialog closes
- The new issue title appears in the issues list

**Severity**: Critical
**Tags**: Smoke, Create

---

### Scenario: Clicking an issue opens its detail dialog

**Given**: At least one issue is visible in the list
**When**: An issue row is clicked
**Then**:
- A detail dialog appears
- The dialog shows the issue title
- Status, severity, and type badges are visible in the dialog

**Severity**: Normal
**Tags**: Regression, Detail

---

## Notes

- Seeded DB should include issues of at least 2 different statuses and 2 different severities.
- Created issues are real DB records — use unique titles to avoid ambiguity.
- The detail dialog is read-only in the current implementation (no edit in the UI).
