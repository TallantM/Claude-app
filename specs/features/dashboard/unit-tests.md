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

### Scenario: Shows loading skeleton while data is fetching

**Given**: `fetch` has not yet resolved
**When**: DashboardPage renders
**Then**:
- Animated skeleton divs are visible
- Stat cards and content are not yet rendered

**Severity**: Normal
**Tags**: Regression, Loading

---

### Scenario: Renders all six stat cards after data loads

**Given**: `fetch` for `/api/dashboard` resolves with mock data
**When**: Component finishes loading
**Then**:
- "Dashboard" heading is visible
- "Total Projects" card shows the value `5`
- "Total Tasks" card shows `42`
- "Completed Tasks" card shows `18`
- "Open Issues" card shows `7`
- "Active Sprints" card shows `2`
- "Team Members" card shows `8`

**Severity**: Critical
**Tags**: Smoke, Render, Stats

---

### Scenario: Recent Activity section is rendered

**Given**: Dashboard data loads with one activity item
**When**: Component renders
**Then**:
- "Recent Activity" section heading is visible
- The activity entry's details text "Created task: Fix login bug" is visible
- The user name "Alice" is visible in the activity entry

**Severity**: Normal
**Tags**: Regression, Activity

---

### Scenario: Task Distribution section is rendered

**Given**: Dashboard data loads with task distribution data
**When**: Component renders
**Then**:
- "Task Distribution" section heading is visible
- "To Do" label is visible
- "In Progress" label is visible
- "Done" label is visible
- Total Tasks count is visible (shows 42)

**Severity**: Normal
**Tags**: Regression, Chart

---

### Scenario: Shows no recent activity message when activity list is empty

**Given**: Dashboard data loads with `recentActivity: []`
**When**: Component renders
**Then**:
- "Recent Activity" heading is visible
- "No recent activity" message is shown

**Severity**: Normal
**Tags**: Regression, Empty State

---

### Scenario: Shows error state when fetch fails

**Given**: `fetch` rejects with a network error
**When**: DashboardPage renders
**Then**:
- "Error loading dashboard" message is visible
- Stat cards are not rendered

**Severity**: Normal
**Tags**: Regression, Error

---

## Notes

- The dashboard fetches data in a `useEffect` — mock `fetch` before rendering.
- The task distribution bar chart is CSS-based (not a canvas chart), so RTL can see it.
- Do not test chart pixel rendering — just verify labels and count values are present.
- The completion rate calculation is derived from stats — verify the percentage text is present.
