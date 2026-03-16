# Sprints — Unit Test Specification

## Test File
`tests/unit/sprints-page.test.tsx`

## Context
Tests are against `ProjectDetailPage` (from `src/app/(app)/projects/[id]/page.tsx`).
We test the Sprints tab rendering.

## Mocks Required
- `next/navigation` → `useRouter`, `useParams` (returning `{ id: "p1" }`), `useSearchParams`, `usePathname`
- `global.fetch` → mock for `/api/projects/p1`

## Mock Data Shape
```typescript
{
  project: { id: "p1", name: "Alpha Project", key: "AP", status: "active", description: null, startDate: null, endDate: null },
  tasks: [],
  sprints: [{
    id: "sp1",
    name: "Sprint 1",
    status: "active",
    goal: "Deliver login feature",
    startDate: "2026-01-01T00:00:00Z",
    endDate: "2026-01-14T00:00:00Z",
    tasks: []
  }]
}
```

## Test Scenarios

1. **renders project name heading**
   - Given: fetch resolves with project data
   - Then: "Alpha Project" heading visible

2. **renders Sprints tab trigger**
   - Given: project detail loaded
   - Then: "Sprints" tab button is visible

3. **Sprints tab shows sprint cards after clicking the tab**
   - Given: project with one sprint
   - When: "Sprints" tab is clicked
   - Then: "Sprint 1" text visible in the sprints panel

4. **Sprints tab shows empty state when no sprints**
   - Given: project with empty sprints array
   - When: "Sprints" tab is clicked
   - Then: "No sprints yet" text is visible

5. **sprint goal is displayed on the sprint card**
   - Given: sprint with goal "Deliver login feature"
   - When: Sprints tab active
   - Then: "Deliver login feature" text visible

6. **sprint status badge is rendered**
   - Given: sprint with status "active"
   - When: Sprints tab active
   - Then: "active" badge visible

7. **shows loading skeleton while data is loading**
   - Given: fetch never resolves
   - Then: `.animate-pulse` skeleton present; "Sprint 1" not visible

8. **Board tab is active by default (not Sprints)**
   - Given: project detail loaded
   - Then: kanban column "To Do" visible without clicking Sprints tab
