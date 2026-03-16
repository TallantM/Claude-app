# Pipelines — Page Object Specification

## Route
`/pipelines`

## Page Object Class
`PipelinesPage` in `tests/e2e/page-objects/pipelines.page.ts`

## Selectors

| Element | Selector |
|---|---|
| Page heading | `h1:has-text("CI/CD Pipelines")` |
| Pipeline card | `[data-testid="pipeline-card"]` |
| Empty state | `[data-testid="empty-state"]` |
| Trigger Run button (within card) | `[data-testid="pipeline-card"] button:has-text("Trigger Run")` |
| Details button (within card) | `[data-testid="pipeline-card"] button:has-text("Details")` |
| Pipeline status badge | `[data-testid="pipeline-card"] .badge` |

## Actions

### `navigate()`
- `goto("/pipelines")`
- `waitForSelector('[data-testid="pipeline-card"], [data-testid="empty-state"], h1', { timeout: 10000 })`

### `getPipelineCardCount()`
- Returns `page.locator('[data-testid="pipeline-card"]').count()`

### `triggerRun(index: number)`
- Clicks "Trigger Run" button on the nth pipeline card

### `toggleDetails(index: number)`
- Clicks "Details" button on the nth pipeline card

### `isEmptyStateVisible()`
- Returns `page.locator('[data-testid="empty-state"]').isVisible()`
