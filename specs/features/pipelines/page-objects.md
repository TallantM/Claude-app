# Page Objects — pipelines

## PipelinesPage

**URL**: `/pipelines`
**File**: `tests/e2e/page-objects/pipelines.page.ts`
**Class**: `PipelinesPage`

### Elements

| Element | Selector | Notes |
|---------|----------|-------|
| Page heading | `h1:has-text("CI/CD Pipelines")` | Confirm page |
| Pipeline cards | `[data-testid="pipeline-card"]` | Repeated per pipeline |
| Empty state | `[data-testid="empty-state"]` | When no pipelines |
| Trigger Run button | `button:has-text("Trigger Run")` inside card | Per card |
| Details button | `button:has-text("Details")` inside card | Toggles expand |
| Status badge | `.rounded-full` dot span | Pipeline status indicator |
| Stages section | `h4:has-text("Stages")` | Inside expanded card |
| Recent Runs section | `h4:has-text("Recent Runs")` | Inside expanded card |

### Methods

- `navigate(): Promise<void>` — goto `/pipelines`, wait for `[data-testid="pipeline-card"]` or `[data-testid="empty-state"]` (Pattern 10, 13)
- `getPipelineCardCount(): Promise<number>` — count `[data-testid="pipeline-card"]`
- `clickTriggerRun(index?: number): Promise<void>` — click "Trigger Run" on nth card (default 0)
- `clickDetails(index?: number): Promise<void>` — click "Details" on nth card
- `isExpandedVisible(index?: number): Promise<boolean>` — check if stages/runs section visible
- `isEmptyStateVisible(): Promise<boolean>` — check `[data-testid="empty-state"]` visibility
