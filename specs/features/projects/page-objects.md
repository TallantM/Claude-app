# Page Objects — projects

## ProjectsPage

**URL**: `/projects`
**File**: `tests/e2e/page-objects/projects.page.ts`
**Class**: `ProjectsPage`

### Elements

| Element | Selector | Notes |
|---------|----------|-------|
| Page heading | `h1:has-text("Projects")` | Confirm page |
| New project button | `[data-testid="new-project-btn"]` | Opens dialog |
| Project cards | `[data-testid="project-card"]` | Repeated per project |
| Empty state | `[data-testid="empty-state"]` | When no projects |
| Search input | `input[placeholder="Search projects..."]` | Text filter |
| Status filter | First `[role="combobox"]` | Radix Select |
| Create dialog | `[role="dialog"]` | Modal |
| Dialog name input | `#name` | Inside dialog |
| Dialog key input | `#key` | Auto-generated |
| Dialog description | `textarea` inside dialog | Optional |
| Dialog submit | `button[type="submit"]:has-text("Create Project")` | |
| Dialog cancel | `button:has-text("Cancel")` | |

### Methods

- `navigate(): Promise<void>` — goto `/projects`, wait for `[data-testid="project-card"]` or `[data-testid="empty-state"]` (Pattern 10, 13)
- `clickNewProjectBtn(): Promise<void>` — click `[data-testid="new-project-btn"]`
- `fillCreateDialog(name: string, description?: string): Promise<void>` — fill form fields in dialog
- `submitCreateDialog(): Promise<void>` — click submit button
- `cancelDialog(): Promise<void>` — click Cancel
- `getProjectCardCount(): Promise<number>` — count `[data-testid="project-card"]`
- `clickFirstProjectCard(): Promise<void>` — click first project card
- `searchProjects(term: string): Promise<void>` — type into search input
- `filterByStatus(status: string): Promise<void>` — interact with status Radix Select
- `isEmptyStateVisible(): Promise<boolean>` — check empty-state visibility
