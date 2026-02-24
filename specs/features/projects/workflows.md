# Projects — End-to-End Workflow Specification

## Test Suite Overview

**Test File**: `tests/e2e/projects.spec.ts`
**What We're Testing**: Complete project management user journeys
**Test Type**: End-to-End Tests (Playwright, authenticated)
**Framework**: `test.describe("Projects", () => { ... })`

---

## Test Configuration

**Browser**: Chromium (headless)
**Base URL**: `http://localhost:3000`
**Auth**: Saved auth state from `tests/e2e/.auth/user.json`
**Prerequisite**: Running app + seeded DB (at least 3 projects of mixed statuses)

---

## Workflow Scenarios

### Workflow: Browse and filter project list

**User Story**: As a developer, I want to browse all projects and filter them by status so that
I can quickly find what I'm working on.

**Steps**:
1. Navigate to `/projects` (authenticated)
2. Verify the project list loads (heading + cards visible)
3. Search for a known project name (partial match)
4. Verify only matching projects show
5. Clear the search
6. Filter by "active" status
7. Verify only active projects are shown
8. Reset to "All Statuses"
9. Verify all projects are back

**Expected Outcome**:
- Search and filter each narrow the list correctly
- Resetting returns to full list

**Severity**: Normal
**Tags**: Regression, Projects, Filter

---

### Workflow: Create a new project and verify it appears in the list

**User Story**: As a project manager, I want to create a new project so that my team has
a place to track work.

**Steps**:
1. Navigate to `/projects` (authenticated)
2. Click "New Project" button
3. Verify create dialog opens
4. Enter a unique project name (e.g., `E2E Test Project {timestamp}`)
5. Verify key is auto-populated from the name
6. Enter a description
7. Click "Create Project"
8. Verify dialog closes
9. Verify the new project name appears in the grid

**Expected Outcome**:
- New project card visible in the list
- Dialog is dismissed

**Severity**: Critical
**Tags**: Smoke, Projects, Create

---

### Workflow: Navigate to project detail from list

**User Story**: As a developer, I want to click a project from the list to open its Kanban board.

**Steps**:
1. Navigate to `/projects` (authenticated)
2. Note the name of the first project card
3. Click the first project card
4. Verify URL changed to `/projects/{id}`
5. Verify the project Kanban board / detail page loads

**Expected Outcome**:
- User is on the project detail page
- Project name or board content is visible

**Severity**: Critical
**Tags**: Smoke, Projects, Navigation

---

### Workflow: Projects require authentication

**User Story**: As a security concern, unauthenticated users should not access project data.

**Steps**:
1. Open a fresh browser context (no auth state)
2. Navigate directly to `/projects`
3. Verify redirect to `/login`

**Expected Outcome**:
- URL ends with `/login`
- Login form is visible

**Severity**: Critical
**Tags**: Smoke, Auth, Security

---

## Coverage

**What's covered**:
- List render + search/filter
- Create project via dialog
- Navigate to project detail
- Auth guard enforcement

**Scenarios Tested**:
- ✅ Project list loads and filters work
- ✅ Create project via dialog
- ✅ Navigate to project detail
- ✅ Unauthenticated redirect

---

## Notes

**Test Data**: DB must have seeded projects for list tests. Create tests generate real records.
**Cleanup**: Consider truncating projects table between test runs or use unique identifiers.
**Pagination**: Only test pagination if DB has >10 projects seeded.
