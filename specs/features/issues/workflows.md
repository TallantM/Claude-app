# Issues — End-to-End Workflow Specification

## Test Suite Overview

**Test File**: `tests/e2e/issues.spec.ts`
**What We're Testing**: Complete issue tracking user journeys
**Test Type**: End-to-End Tests (Playwright, authenticated)
**Framework**: `test.describe("Issues", () => { ... })`

---

## Test Configuration

**Browser**: Chromium (headless)
**Base URL**: `http://localhost:3000`
**Auth**: Saved auth state from `tests/e2e/.auth/user.json`
**Prerequisite**: Running app + seeded DB with multiple issues

---

## Workflow Scenarios

### Workflow: Browse and filter the issue list

**User Story**: As a developer, I want to browse all issues and filter them by status and severity
so that I can focus on critical open bugs.

**Steps**:
1. Navigate to `/issues` (authenticated)
2. Verify issue list loads with visible rows
3. Select "Open" from the status filter
4. Verify the visible issues only show "open" status badge
5. Select "Critical" from the severity filter (while status = "Open")
6. Verify only critical + open issues remain
7. Reset both filters to "All"
8. Verify full list is back

**Expected Outcome**:
- Stacked filters work correctly
- Resetting shows the full list

**Severity**: Normal
**Tags**: Regression, Issues, Filter

---

### Workflow: Report a new issue

**User Story**: As a tester, I want to report a new bug so that the development team can
track and fix it.

**Steps**:
1. Navigate to `/issues` (authenticated)
2. Click "New Issue" button
3. Verify create dialog opens
4. Enter a unique title (e.g., `E2E Bug Report {timestamp}`)
5. Enter a description
6. Keep default type (bug) and severity (medium)
7. Click "Create Issue"
8. Verify dialog closes
9. Verify the new issue title appears in the list

**Expected Outcome**:
- New issue is visible in the list
- Dialog is dismissed after submit

**Severity**: Critical
**Tags**: Smoke, Issues, Create

---

### Workflow: Search for an issue by title

**User Story**: As a developer, I want to quickly find a specific issue by typing part of its title.

**Steps**:
1. Navigate to `/issues` (authenticated, multiple issues loaded)
2. Note the title of a known issue
3. Type the first word of that title into the search input
4. Verify the list narrows to show matching issues
5. Clear the search
6. Verify full list is restored

**Expected Outcome**:
- Matching issues visible, others hidden
- Clearing search restores full list

**Severity**: Normal
**Tags**: Regression, Issues, Search

---

### Workflow: View issue details

**User Story**: As a project manager, I want to click on an issue to see its full details
including description, severity, status, and assignee.

**Steps**:
1. Navigate to `/issues` (authenticated)
2. Click on the first issue in the list
3. Verify a detail dialog appears
4. Verify the dialog shows the issue title
5. Verify status and severity badges are visible
6. Close the dialog

**Expected Outcome**:
- Detail dialog is visible with issue information
- Dialog can be dismissed

**Severity**: Normal
**Tags**: Regression, Issues, Detail

---

### Workflow: Issues require authentication

**User Story**: Unauthenticated users should not access issue data.

**Steps**:
1. Open a fresh browser context (no auth)
2. Navigate to `/issues`
3. Verify redirect to `/login`

**Expected Outcome**:
- URL ends with `/login`

**Severity**: Critical
**Tags**: Smoke, Auth, Security

---

## Coverage

**What's covered**:
- Issue list loads and filters (status + severity stacked)
- Create new issue via dialog
- Client-side search by title
- View issue details via dialog
- Auth guard

**Scenarios Tested**:
- ✅ Browse and filter issues
- ✅ Create a new issue
- ✅ Search by title
- ✅ View issue detail
- ✅ Auth guard

---

## Notes

**Test Data**: Seeded DB with issues of multiple statuses and severities required.
**New Issues**: Tests that create issues use timestamp-based titles to avoid collisions.
**Read-only Detail**: The detail dialog is read-only; no edit/update flow in the UI.
