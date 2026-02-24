# Projects — Unit Test Specification

## Test Suite Overview

**Test File**: `tests/unit/projects-page.test.tsx`
**What We're Testing**: ProjectsPage React component in isolation
**Test Type**: Unit Tests (Vitest + React Testing Library)
**Framework**: `describe("ProjectsPage", () => { ... })`

### Purpose
Validate that the ProjectsPage renders correctly, handles search input, opens/closes the
create dialog, calls the API correctly on form submit, and handles loading/error states —
all without a real server.

---

## Test Configuration

**Environment**: jsdom
**Mocks Required**:
- `global.fetch` → mock `/api/projects` GET and POST
- `next/navigation` → mock `useRouter`
- `@/hooks/use-pagination` → either mock the hook directly or mock `fetch` to return paginated data

**Mock API Response** (for GET /api/projects):
```json
{
  "data": [
    { "id": "1", "name": "Alpha Project", "key": "AP", "status": "active",
      "taskCount": 5, "openIssues": 2, "description": "First project", "teamName": null }
  ],
  "pagination": { "total": 1, "page": 1, "pageSize": 10, "totalPages": 1 }
}
```

---

## Test Scenarios

### Scenario: Shows loading skeleton while data is fetching

**Given**: `fetch` has not yet resolved
**When**: ProjectsPage renders
**Then**:
- Animated skeleton elements are visible (pulse divs)
- No project cards are shown yet

**Severity**: Normal
**Tags**: Regression, Loading

---

### Scenario: Renders project cards after data loads

**Given**: `fetch` for `/api/projects` resolves with one project: "Alpha Project"
**When**: Component finishes loading
**Then**:
- "Projects" heading is visible
- A card containing "Alpha Project" is rendered
- "New Project" button is visible

**Severity**: Critical
**Tags**: Smoke, Render

---

### Scenario: Shows empty state when no projects exist

**Given**: `fetch` resolves with `{ data: [], pagination: { total: 0, ... } }`
**When**: Component renders
**Then**:
- "No projects found" message is visible
- "Create Project" button inside the empty state is visible

**Severity**: Normal
**Tags**: Regression, Empty State

---

### Scenario: Opens create project dialog on button click

**Given**: Page has loaded with projects
**When**: "New Project" button is clicked
**Then**:
- A dialog containing "Create New Project" heading appears
- Project Name input is visible inside the dialog
- "Create Project" submit button is inside the dialog

**Severity**: Normal
**Tags**: Regression, Dialog

---

### Scenario: Closes dialog and resets form on Cancel

**Given**: Create project dialog is open
**When**: "Cancel" button is clicked
**Then**:
- Dialog is no longer visible
- Name input no longer shows in the DOM (dialog closed)

**Severity**: Normal
**Tags**: Regression, Dialog

---

### Scenario: Submits new project form and refreshes list

**Given**: Dialog is open and "My Test Project" is typed in the name field
**When**: "Create Project" button is clicked and `fetch` POST resolves with `{ ok: true }`
**Then**:
- `fetch` is called with method POST to `/api/projects`
- The request body includes `name: "My Test Project"`
- Dialog closes after successful submit
- Data re-fetches (fetch called again for GET)

**Severity**: Critical
**Tags**: Smoke, Create

---

### Scenario: Shows error state when fetch fails

**Given**: `fetch` rejects with a network error
**When**: Component renders
**Then**:
- "Error loading projects" message is visible

**Severity**: Normal
**Tags**: Regression, Error

---

## Notes

- The `usePagination` hook wraps `fetch` — mock `fetch` rather than the hook.
- Auto-generated project key from name (via `generateKey`) doesn't need direct testing here;
  it's a utility function that can be tested in a separate utils test.
- Search filtering is server-side; unit tests verify the input exists and is bound,
  not that server filtering happens.
