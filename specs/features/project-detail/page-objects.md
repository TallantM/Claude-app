# Page Objects — project-detail

## ProjectDetailPage

**URL**: `/projects/[id]`
**File**: `tests/e2e/page-objects/project-detail.page.ts`
**Class**: `ProjectDetailPage`

### Elements

| Element | Selector | Notes |
|---------|----------|-------|
| Back button | `[data-testid="back-to-projects"]` | Returns to /projects |
| Project title | `h1` | Project name heading |
| Kanban col todo | `[data-testid="kanban-col-todo"]` | Board column |
| Kanban col in progress | `[data-testid="kanban-col-in-progress"]` | Board column |
| Kanban col in review | `[data-testid="kanban-col-in_review"]` | Note underscore |
| Kanban col done | `[data-testid="kanban-col-done"]` | Board column |
| Task cards | `[data-testid="task-card"]` | Repeated per task |
| Add task button | `button:has-text("Add task")` | Per column |
| Task dialog | `[role="dialog"]` | Create/detail modal |
| Task title input | `#task-title` | Inside create dialog |
| Task submit | `button[type="submit"]:has-text("Create Task")` | |
| Board tab | `[role="tab"]:has-text("Board")` | |
| Backlog tab | `[role="tab"]:has-text("Backlog")` | |
| Sprints tab | `[role="tab"]:has-text("Sprints")` | |
| Settings tab | `[role="tab"]:has-text("Settings")` | |

### Methods

- `navigate(projectId: string): Promise<void>` — goto `/projects/${projectId}`, wait for `[data-testid="kanban-col-todo"]` (Pattern 10)
- `clickBackButton(): Promise<void>` — click `[data-testid="back-to-projects"]`
- `clickAddTask(column: string): Promise<void>` — click "Add task" inside `[data-testid="kanban-col-${column}"]`
- `fillCreateTaskDialog(title: string): Promise<void>` — fill `#task-title`
- `submitCreateTaskDialog(): Promise<void>` — click submit
- `getTaskCardCount(column?: string): Promise<number>` — count `[data-testid="task-card"]` optionally scoped to column
- `clickFirstTaskCard(): Promise<void>` — click first `[data-testid="task-card"]`
- `clickTab(name: string): Promise<void>` — click tab trigger by text
