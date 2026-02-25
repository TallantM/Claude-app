# Dashboard — Unit Test Specification

## Test Suite Overview

**Test File**: `tests/unit/dashboard-page.test.tsx`
**What We're Testing**: DashboardPage React component in isolation
**Test Type**: Unit Tests (Vitest + React Testing Library)
**Framework**: `describe("DashboardPage", () => { ... })`

### Purpose
Validate that DashboardPage renders the correct stat cards, shows the activity feed and
task distribution sections, handles loading state, and handles error state — all without
a real server.

---

## Test Configuration

**Environment**: jsdom
**Mocks Required**:
- `global.fetch` → mock `/api/dashboard` GET response
- `next/navigation` → not needed (dashboard doesn't navigate on load)

**Mock API Response** (for GET /api/dashboard):
```json
{
  "data": {
    "stats": {
      "totalProjects": 5,
      "totalTasks": 42,
      "completedTasks": 18,
      "openIssues": 7,
      "activeSprints": 2,
      "teamMembers": 8
    },
    "recentActivity": [
      {
        "id": "1", "type": "created", "entity": "task",
        "details": "Created task: Fix login bug",
        "createdAt": "2026-01-10T10:00:00Z",
        "user": { "name": "Alice", "image": null }
      }
    ],
    "taskDistribution": [
      { "label": "todo", "value": 15 },
      { "label": "in_progress", "value": 9 },
      { "label": "in_review", "value": 0 },
      { "label": "done", "value": 18 }
    ]
  }
}
```

---

## Test Scenarios

1. **shows loading skeleton while data is fetching**
   - Given: `fetch` has not yet resolved
   - When: DashboardPage renders
   - Then: animated skeleton divs are visible; stat cards and content are not yet rendered

2. **renders all six stat cards after data loads**
   - Given: `fetch` for `/api/dashboard` resolves with mock data
   - When: component finishes loading
   - Then: "Dashboard" heading, and stat cards for Total Projects (5), Total Tasks (42), Completed Tasks (18), Open Issues (7), Active Sprints (2), Team Members (8) are all visible

3. **recent activity section is rendered with activity items**
   - Given: dashboard data loads with one activity item
   - When: component renders
   - Then: "Recent Activity" heading, "Created task: Fix login bug" details, and "Alice" user name are visible

4. **task distribution section is rendered**
   - Given: dashboard data loads with task distribution data
   - When: component renders
   - Then: "Task Distribution" heading, "To Do", "In Progress", and "Done" labels, and total tasks count (42) are visible

5. **shows no recent activity message when activity list is empty**
   - Given: dashboard data loads with `recentActivity: []`
   - When: component renders
   - Then: "Recent Activity" heading is visible and "No recent activity" message is shown

6. **shows error state when fetch fails**
   - Given: `fetch` rejects with a network error
   - When: DashboardPage renders
   - Then: "Error loading dashboard" message is visible; stat cards are not rendered

---

## Notes

- The dashboard fetches data in a `useEffect` — mock `fetch` before rendering.
- The task distribution bar chart is CSS-based (not a canvas chart), so RTL can see it.
- Do not test chart pixel rendering — just verify labels and count values are present.
- The completion rate calculation is derived from stats — verify the percentage text is present.
