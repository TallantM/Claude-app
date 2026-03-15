# Workflows — project-detail

1. **kanban board renders with all four columns**
   - Use stored auth state
   - Navigate to `/projects`, wait for first `[data-testid="project-card"]`
   - Click first project card
   - Wait for `[data-testid="kanban-col-todo"]` (timeout 10000ms)
   - Assert all four kanban columns visible: `kanban-col-todo`, `kanban-col-in-progress`, `kanban-col-in_review`, `kanban-col-done`

2. **add a new task via the Board tab Add task button**
   - Navigate to a project detail page
   - Click "Add task" button inside `[data-testid="kanban-col-todo"]`
   - Assert "Create New Task" dialog is visible
   - Fill task title with unique name (Pattern 5)
   - Click "Create Task"
   - Wait for dialog to close
   - Assert new task title appears in `[data-testid="kanban-col-todo"]`

3. **clicking task card opens task detail dialog**
   - Navigate to a project with at least one task
   - Click first `[data-testid="task-card"]`
   - Assert dialog with task title visible (role="dialog")

4. **back button navigates to /projects list**
   - Navigate to a project detail page
   - Click `[data-testid="back-to-projects"]`
   - Assert URL matches `/projects`
   - Assert `[data-testid="project-card"]` or `[data-testid="empty-state"]` is visible

5. **Sprints tab is accessible and renders sprint content**
   - Navigate to a project detail page
   - Click "Sprints" tab trigger
   - Assert tab content panel is visible
   - Assert "No sprints yet" message or sprint card is present
