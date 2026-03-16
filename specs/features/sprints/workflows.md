# Sprints — E2E Workflow Specification

## Test File
`tests/e2e/sprints.spec.ts`

## Auth
All tests use `storageState: ".auth/user.json"` (authenticated user).

## Navigation Pattern
There is no `/sprints` page. Navigate to `/projects`, click a project, then click the Sprints tab.

## Workflows

1. **navigates to a project and finds the Sprints tab**
   - Go to `/projects`
   - Wait for at least one project card to be visible
   - Click the first project
   - Assert: project detail page loaded (h1 visible)
   - Assert: "Sprints" tab trigger is visible

2. **Sprints tab shows sprint content or empty state**
   - Navigate to project detail
   - Click "Sprints" tab
   - Wait for tabpanel `data-state="active"`
   - Assert: either sprint cards OR "No sprints yet" message visible

3. **Board tab is default (not Sprints)**
   - Navigate to project detail
   - Assert: "To Do" kanban column is visible without clicking Sprints tab
   - Assert: `[data-testid="kanban-col-todo"]` is present

4. **switching between tabs works correctly**
   - Navigate to project detail
   - Click "Sprints" tab
   - Assert: Sprints tabpanel is active
   - Click "Board" tab
   - Assert: kanban board (To Do column) is visible again

5. **Back to Projects button navigates to /projects**
   - Navigate to project detail
   - Click `[data-testid="back-to-projects"]`
   - Assert: URL is `/projects`
