# Workflows — pipelines

1. **pipelines list loads with at least one card (seeded data)**
   - Use stored auth state
   - Navigate to `/pipelines`
   - Wait for `[data-testid="pipeline-card"]` or `[data-testid="empty-state"]`
   - Assert first `[data-testid="pipeline-card"]` is visible

2. **Details button expands pipeline card to show stages and runs**
   - Navigate to `/pipelines`, wait for pipeline cards
   - Click "Details" button on first pipeline card
   - Assert expanded section visible (stages or "Recent Runs" heading)
   - Click "Details" again — assert section no longer visible

3. **Trigger Run button triggers a pipeline run**
   - Navigate to `/pipelines`, wait for cards
   - Click "Trigger Run" on first pipeline card
   - Assert button shows loading state (spinner or "Trigger Run" disabled) briefly
   - Assert button returns to normal state after API call completes

4. **empty state renders when no pipelines are configured (conditional skip if DB seeded)**
   - Navigate to `/pipelines`
   - Check: `const isEmpty = (await page.locator('[data-testid="empty-state"]').count()) > 0`
   - If not empty: `test.skip()` — conditional skip if DB is seeded
   - Assert `[data-testid="empty-state"]` visible with "No pipelines configured"

5. **pagination controls are present when multiple pipelines exist**
   - Navigate to `/pipelines`, wait for cards
   - Assert page renders without error
   - If more than one page: assert pagination component visible
