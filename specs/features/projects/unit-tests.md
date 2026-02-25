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

1. **shows loading skeleton while data is fetching**
   - Given: `fetch` has not yet resolved
   - When: ProjectsPage renders
   - Then: animated skeleton pulse divs are visible; no project cards are shown yet

2. **renders project cards after data loads**
   - Given: `fetch` for `/api/projects` resolves with one project: "Alpha Project"
   - When: component finishes loading
   - Then: "Projects" heading, a card containing "Alpha Project", and "New Project" button are all visible

3. **shows empty state when no projects exist**
   - Given: `fetch` resolves with `{ data: [], pagination: { total: 0, ... } }`
   - When: component renders
   - Then: "No projects found" message and "Create Project" button inside the empty state are visible

4. **opens create project dialog on button click**
   - Given: page has loaded with projects
   - When: "New Project" button is clicked
   - Then: a dialog with "Create New Project" heading, Project Name input, and "Create Project" submit button appears

5. **closes dialog and resets form on Cancel**
   - Given: create project dialog is open
   - When: "Cancel" button is clicked
   - Then: dialog is no longer visible and name input is removed from the DOM

6. **submits new project form and refreshes list**
   - Given: dialog is open and "My Test Project" is typed in the name field
   - When: "Create Project" is clicked and `fetch` POST resolves with `{ ok: true }`
   - Then: `fetch` is called with POST to `/api/projects` with body containing `name: "My Test Project"`; dialog closes; data re-fetches

7. **shows error state when fetch fails**
   - Given: `fetch` rejects with a network error
   - When: component renders
   - Then: "Error loading projects" message is visible

---

## Notes

- The `usePagination` hook wraps `fetch` — mock `fetch` rather than the hook.
- Auto-generated project key from name (via `generateKey`) doesn't need direct testing here;
  it's a utility function that can be tested in a separate utils test.
- Search filtering is server-side; unit tests verify the input exists and is bound,
  not that server filtering happens.
