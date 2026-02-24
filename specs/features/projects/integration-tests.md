# Projects — Integration Test Specification

## Test Suite Overview

**Test File**: `tests/e2e/projects.spec.ts` (focused integration scenarios)
**What We're Testing**: ProjectsPage Page Object working with a real browser + running app.
**Test Type**: Integration Tests (Playwright, authenticated session)
**Framework**: `test.describe("Projects - Integration", () => { ... })`

---

## Test Configuration

**Browser**: Chromium (headless)
**Base URL**: `http://localhost:3000`
**Auth**: Uses saved auth state from `tests/e2e/.auth/user.json`
**Prerequisite**: App running + DB seeded with at least one project

---

## Test Scenarios

### Scenario: Projects page loads and shows list

**Given**: Authenticated user navigates to `/projects`
**When**: Page has loaded
**Then**:
- URL is `/projects`
- "Projects" heading is visible
- At least one project card is visible (from seeded data)
- "New Project" button is visible

**Severity**: Critical
**Tags**: Smoke, Render

---

### Scenario: Status filter narrows the project list

**Given**: Authenticated user is on `/projects` with projects of multiple statuses in DB
**When**: "Active" is selected from the status filter
**Then**:
- Only projects with status "active" are shown (any projects showing "archived" badge disappear)
- When "All Statuses" is selected, all projects reappear

**Severity**: Normal
**Tags**: Regression, Filter

---

### Scenario: Search input filters projects by name

**Given**: Authenticated user is on `/projects` with multiple projects
**When**: A project name (or part of it) is typed into the search input
**Then**:
- Only projects matching the search term appear in the grid
- Clearing the search restores the full list

**Severity**: Normal
**Tags**: Regression, Search

---

### Scenario: New Project button opens the create dialog

**Given**: Authenticated user is on `/projects`
**When**: "New Project" button is clicked
**Then**:
- A dialog appears with the title "Create New Project"
- Project Name, Project Key, Description, and Status fields are visible
- "Create Project" and "Cancel" buttons are in the dialog

**Severity**: Normal
**Tags**: Regression, Dialog

---

### Scenario: Creating a project adds it to the list

**Given**: Dialog is open
**When**: A unique project name is typed and "Create Project" is submitted
**Then**:
- Dialog closes
- The new project name appears in the project cards grid

**Severity**: Critical
**Tags**: Smoke, Create

---

### Scenario: Clicking a project card navigates to the project detail page

**Given**: At least one project card is visible
**When**: The first project card is clicked
**Then**:
- URL changes to `/projects/{id}`
- The project detail (Kanban board) page is displayed

**Severity**: Critical
**Tags**: Smoke, Navigation

---

### Scenario: Pagination controls are shown when results exceed page size

**Given**: DB has more projects than the default page size (10)
**When**: User is on `/projects`
**Then**:
- Pagination controls are visible
- Page 1 is active
- Clicking "next" or page 2 loads the next set of projects

**Severity**: Normal
**Tags**: Regression, Pagination

---

## Notes

- These tests require a seeded database with multiple projects.
- Use `db:seed` before running: `npm run db:seed`.
- New project tests create real records — they don't clean up automatically.
  Consider a dedicated test DB or cleanup step.
