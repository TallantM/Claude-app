# Issues — Unit Test Specification

## Test Suite Overview

**Test File**: `tests/unit/issues-page.test.tsx`
**What We're Testing**: IssuesPage React component in isolation
**Test Type**: Unit Tests (Vitest + React Testing Library)
**Framework**: `describe("IssuesPage", () => { ... })`

### Purpose
Validate that IssuesPage renders correctly, displays issue data, opens the create dialog,
submits the form, handles client-side search filtering, and shows loading/error states.

---

## Test Configuration

**Environment**: jsdom
**Mocks Required**:
- `global.fetch` → mock `/api/issues` GET and POST
- `next/navigation` → not needed (issues page doesn't navigate away)

**Mock API Response** (for GET /api/issues):
```json
{
  "data": [
    {
      "id": "1", "title": "Login button broken", "status": "open",
      "severity": "high", "type": "bug", "description": "Cannot log in",
      "reproSteps": null, "projectId": "p1", "assigneeId": null, "reporterId": "u1",
      "createdAt": "2026-01-01T00:00:00Z", "updatedAt": "2026-01-01T00:00:00Z",
      "project": { "id": "p1", "name": "Alpha", "key": "AL" }
    },
    {
      "id": "2", "title": "Dark mode feature", "status": "in_progress",
      "severity": "medium", "type": "feature", "description": null,
      "reproSteps": null, "projectId": "p1", "assigneeId": null, "reporterId": "u1",
      "createdAt": "2026-01-02T00:00:00Z", "updatedAt": "2026-01-02T00:00:00Z",
      "project": { "id": "p1", "name": "Alpha", "key": "AL" }
    }
  ],
  "pagination": { "total": 2, "page": 1, "pageSize": 10, "totalPages": 1 }
}
```

---

## Test Scenarios

### Scenario: Shows loading skeleton while data is fetching

**Given**: `fetch` has not yet resolved
**When**: IssuesPage renders
**Then**:
- Skeleton pulse elements are visible
- No issue cards are shown yet

**Severity**: Normal
**Tags**: Regression, Loading

---

### Scenario: Renders issue list after data loads

**Given**: `fetch` resolves with two issues: "Login button broken" and "Dark mode feature"
**When**: Component finishes loading
**Then**:
- "Issues" heading is visible
- "Login button broken" issue title is visible
- "Dark mode feature" issue title is visible
- "New Issue" button is visible

**Severity**: Critical
**Tags**: Smoke, Render

---

### Scenario: Client-side search filters visible issues

**Given**: Two issues loaded: "Login button broken" and "Dark mode feature"
**When**: "Login" is typed into the search input
**Then**:
- Only "Login button broken" is visible
- "Dark mode feature" is not visible

**Severity**: Normal
**Tags**: Regression, Search

---

### Scenario: Shows empty state when no issues exist

**Given**: `fetch` resolves with `{ data: [], pagination: { total: 0, ... } }`
**When**: Component renders
**Then**:
- "No issues found" text is visible
- No issue cards are in the DOM

**Severity**: Normal
**Tags**: Regression, Empty State

---

### Scenario: Opens create issue dialog on New Issue click

**Given**: Issue list has loaded
**When**: "New Issue" button is clicked
**Then**:
- "Report New Issue" dialog heading appears
- Title input is visible inside the dialog
- "Create Issue" and "Cancel" buttons are in the dialog

**Severity**: Normal
**Tags**: Regression, Dialog

---

### Scenario: Submits new issue form and refreshes list

**Given**: Create issue dialog is open and "My Bug Report" is typed in the title field
**When**: "Create Issue" is clicked and `fetch` POST resolves `{ ok: true }`
**Then**:
- `fetch` is called with POST to `/api/issues`
- Request body contains `title: "My Bug Report"`
- Dialog closes after successful submit
- GET is called again (refetch)

**Severity**: Critical
**Tags**: Smoke, Create

---

### Scenario: Shows error state when fetch fails

**Given**: `fetch` rejects with a network error
**When**: Component renders
**Then**:
- "Error loading issues" message is visible

**Severity**: Normal
**Tags**: Regression, Error

---

## Notes

- Status and severity filters use server-side filtering via the `usePagination` hook params.
  In unit tests, verify the component has the filter controls but don't test server behavior.
- The detail dialog (click issue to view) can be tested by mocking click interaction and
  verifying the dialog renders the clicked issue's title.
