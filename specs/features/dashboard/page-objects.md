# Page Objects — dashboard

## DashboardPage

**URL**: `/dashboard`
**File**: `tests/e2e/page-objects/dashboard.page.ts`
**Class**: `DashboardPage`

### Elements

| Element | Selector | Notes |
|---------|----------|-------|
| Page heading | `h1:has-text("Dashboard")` | Confirms page |
| Projects stat card | `[data-testid="stat-card-projects"]` | Loading indicator |
| Tasks stat card | `[data-testid="stat-card-tasks"]` | |
| Completed tasks card | `[data-testid="stat-card-completed-tasks"]` | |
| Open issues card | `[data-testid="stat-card-issues"]` | |
| Active sprints card | `[data-testid="stat-card-sprints"]` | |
| Team members card | `[data-testid="stat-card-team"]` | |
| Activity feed | `[data-testid="activity-feed"]` | Recent activity card |
| Task dist todo | `[data-testid="task-dist-todo"]` | |
| Task dist in progress | `[data-testid="task-dist-in-progress"]` | |
| Task dist in review | `[data-testid="task-dist-in_review"]` | Note underscore |
| Task dist done | `[data-testid="task-dist-done"]` | |
| Loading skeleton | `.animate-pulse` | Visible during load |

### Methods

- `navigate(): Promise<void>` — goto `/dashboard`, wait for `[data-testid="stat-card-projects"]` with timeout 15000ms (Pattern 6, 10)
- `isLoaded(): Promise<boolean>` — check `stat-card-projects` is visible
- `getStatCardValue(testId: string): Promise<string>` — get text of `[data-testid="${testId}"] .text-2xl`
- `isActivityFeedVisible(): Promise<boolean>` — check `[data-testid="activity-feed"]` visibility
- `isTaskDistributionVisible(): Promise<boolean>` — check "Task Distribution" heading visibility
