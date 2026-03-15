# Unit Tests — pipelines

1. **shows loading skeleton while fetch is pending**
   - Mock `fetch` with never-resolving promise
   - Render `PipelinesPage`
   - Assert animate-pulse skeleton elements visible
   - Assert no `[data-testid="pipeline-card"]` rendered

2. **renders pipeline cards after data loads**
   - Mock `fetch` to return `{ data: [{ id: "1", name: "Build Pipeline", status: "idle", projectId: "p1", stages: [], runs: [], createdAt: "2026-01-01T00:00:00Z", updatedAt: "2026-01-01T00:00:00Z" }], pagination: { total: 1, page: 1, pageSize: 10, totalPages: 1 } }`
   - Assert `[data-testid="pipeline-card"]` is visible
   - Assert "Build Pipeline" text in document

3. **shows empty state when no pipelines exist**
   - Mock `fetch` to return `{ data: [], pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 } }`
   - Assert `[data-testid="empty-state"]` visible
   - Assert "No pipelines configured" text shown

4. **renders last run status when pipeline has runs**
   - Mock `fetch` with pipeline including `runs: [{ id: "r1", status: "success", branch: "main", commitSha: "abc1234", duration: 120, startedAt: "2026-01-01T00:00:00Z", finishedAt: "2026-01-01T00:00:00Z" }]`
   - Assert "success" text in the pipeline card
   - Assert "Last run:" label visible

5. **shows "No runs yet" when pipeline has no runs**
   - Mock `fetch` with pipeline with `runs: []`
   - Assert "No runs yet" text visible

6. **Trigger Run button calls POST /api/pipelines/{id}/trigger**
   - Mock `fetch` for initial GET and for POST trigger
   - Click "Trigger Run" button on first pipeline card
   - Assert `fetch` called with POST to `/api/pipelines/1/trigger`

7. **Details button toggles expanded section with stages and runs**
   - Mock `fetch` with pipeline having stages and runs
   - Click "Details" button on pipeline card
   - Assert stages section or recent runs section becomes visible
   - Click "Details" again — assert section collapses

8. **pipeline status dot renders correct color class**
   - Mock pipelines with different statuses: `idle`, `running`, `success`, `failed`
   - Assert each card has the appropriate dot color class in the DOM

9. **shows error state when fetch rejects**
   - Mock `fetch` to throw
   - Assert "Error loading pipelines" visible

10. **formats duration correctly**
    - Mock pipeline with `runs: [{ duration: 90, ... }]`
    - Assert "1m 30s" text visible in the card
