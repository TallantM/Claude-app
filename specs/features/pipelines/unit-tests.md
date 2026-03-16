# Pipelines — Unit Test Specification

## Test File
`tests/unit/pipelines-page.test.tsx`

## Mocks Required
- `next/navigation` → `useRouter`, `useSearchParams`, `usePathname`
- `global.fetch` → mock paginated API response

## Mock Data Shape
```typescript
{
  data: [{
    id: "pipe1",
    name: "Build & Deploy",
    status: "success",
    projectId: "p1",
    config: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    project: { id: "p1", name: "Alpha", key: "AL" },
    stages: [{ id: "s1", name: "build", order: 1 }, { id: "s2", name: "test", order: 2 }],
    runs: [{ id: "r1", status: "success", branch: "main", commitSha: "abc1234", duration: 120, startedAt: "2026-01-01T00:00:00Z", finishedAt: "2026-01-01T00:02:00Z" }]
  }],
  pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 }
}
```

## Test Scenarios

1. **renders the page heading and pipeline cards after data loads**
   - Given: fetch resolves with one pipeline
   - Then: "CI/CD Pipelines" heading and pipeline name "Build & Deploy" are visible

2. **shows empty state when no pipelines exist**
   - Given: fetch resolves with empty data array
   - Then: `[data-testid="empty-state"]` element is visible with "No pipelines configured"

3. **shows loading skeleton while data is loading**
   - Given: fetch never resolves
   - Then: `.animate-pulse` skeleton elements are in the DOM; pipeline card is not

4. **shows error state when fetch fails**
   - Given: fetch resolves with `{ ok: false }`
   - Then: "Error loading pipelines" text is visible

5. **renders Trigger Run button for each pipeline card**
   - Given: fetch resolves with one pipeline
   - Then: a button with "Trigger Run" text is visible

6. **renders Details toggle button for each pipeline card**
   - Given: fetch resolves with one pipeline
   - Then: a button with "Details" text is visible

7. **expands pipeline details when Details button is clicked**
   - Given: pipeline with stages loaded
   - When: "Details" button is clicked
   - Then: stages section becomes visible (e.g. "build" and "test" stage badges)

8. **collapses pipeline details when Details clicked again**
   - Given: details already expanded
   - When: "Details" button is clicked again
   - Then: stage badges are no longer visible

9. **renders project key and name in card description**
   - Given: pipeline has a project association
   - Then: "AL - Alpha" text is visible in the card description

10. **renders last run branch information**
    - Given: pipeline with a run that has branch "main"
    - Then: "main" branch text is visible in the card
