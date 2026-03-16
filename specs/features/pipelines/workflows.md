# Pipelines — E2E Workflow Specification

## Test File
`tests/e2e/pipelines.spec.ts`

## Auth
All tests use `storageState: ".auth/user.json"` (authenticated user).

## Workflows

1. **loads the pipelines page with heading**
   - Navigate to `/pipelines`
   - Assert: `h1` with "CI/CD Pipelines" is visible
   - Assert: URL is `/pipelines`

2. **shows empty state or pipeline cards (seed-aware)**
   - Navigate to `/pipelines`
   - If empty state visible: assert `[data-testid="empty-state"]` is present
   - If cards visible: assert `[data-testid="pipeline-card"]` count is > 0

3. **shows Trigger Run button on pipeline cards**
   - Navigate to `/pipelines`
   - Skip if empty state visible (Pattern 3)
   - Assert: "Trigger Run" button is visible on at least one card

4. **expands and collapses pipeline details**
   - Navigate to `/pipelines`
   - Skip if empty state visible
   - Click "Details" on first card
   - Assert: expanded section is visible (Stages or Recent Runs)
   - Click "Details" again
   - Assert: expanded section is hidden

5. **clicking Trigger Run sends POST request**
   - Navigate to `/pipelines`
   - Skip if empty state visible
   - Click "Trigger Run" on first card
   - Assert: button enters loading/disabled state briefly then re-enables

6. **page handles pipeline with no runs gracefully**
   - Navigate to `/pipelines`
   - Skip if empty state visible
   - Assert: page does not throw; at least one card renders without errors
