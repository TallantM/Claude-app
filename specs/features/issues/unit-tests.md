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

1. **shows loading skeleton while data is fetching**
   - Given: `fetch` has not yet resolved
   - When: IssuesPage renders
   - Then: skeleton pulse elements are visible; no issue cards are shown yet

2. **renders issue list after data loads**
   - Given: `fetch` resolves with two issues: "Login button broken" and "Dark mode feature"
   - When: component finishes loading
   - Then: "Issues" heading, both issue titles, and "New Issue" button are visible

3. **client-side search filters visible issues**
   - Given: two issues loaded
   - When: "Login" is typed into the search input
   - Then: only "Login button broken" is visible; "Dark mode feature" is not visible

4. **shows empty state when no issues exist**
   - Given: `fetch` resolves with `{ data: [], pagination: { total: 0, ... } }`
   - When: component renders
   - Then: "No issues found" text is visible; no issue cards are in the DOM

5. **opens create issue dialog on New Issue click**
   - Given: issue list has loaded
   - When: "New Issue" button is clicked
   - Then: "Report New Issue" dialog heading appears with title input, "Create Issue" button, and "Cancel" button

6. **submits new issue form and refreshes list**
   - Given: create issue dialog is open and "My Bug Report" is typed in the title field
   - When: "Create Issue" is clicked and `fetch` POST resolves `{ ok: true }`
   - Then: `fetch` is called with POST to `/api/issues` with body containing `title: "My Bug Report"`; dialog closes; GET is called again

7. **shows error state when fetch fails**
   - Given: `fetch` rejects with a network error
   - When: component renders
   - Then: "Error loading issues" message is visible

---

## Notes

- Status and severity filters use server-side filtering via the `usePagination` hook params.
  In unit tests, verify the component has the filter controls but don't test server behavior.
- The detail dialog (click issue to view) can be tested by mocking click interaction and
  verifying the dialog renders the clicked issue's title.
