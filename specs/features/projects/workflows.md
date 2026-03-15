# Workflows — projects

1. **project list loads with at least one project card (seeded data)**
   - Use stored auth state
   - Navigate to `/projects`
   - Wait for `[data-testid="project-card"]` or `[data-testid="empty-state"]`
   - Assert `[data-testid="project-card"].first()` is visible (seed guarantees data)
   - Assert `[data-testid="new-project-btn"]` is visible

2. **create new project via dialog and verify it appears in list**
   - Navigate to `/projects`, wait for page to stabilize (Pattern 13)
   - Record count of `[data-testid="project-card"]` before
   - Click `[data-testid="new-project-btn"]`
   - Assert dialog with "Create New Project" heading appears
   - Fill project name `E2E Project ${suffix}` (Pattern 5)
   - Click "Create Project"
   - Wait for dialog to close
   - Assert new project name text is visible in the grid

3. **clicking a project card navigates to project detail**
   - Navigate to `/projects`, wait for `[data-testid="project-card"]`
   - Click first `[data-testid="project-card"]`
   - Assert URL matches `/projects/`
   - Assert `[data-testid="kanban-col-todo"]` is visible

4. **status filter narrows visible projects**
   - Navigate to `/projects`, wait for cards
   - Select "Active" from status filter
   - Wait for list to settle (Pattern 13)
   - Assert all visible cards show "active" badge (not "archived")

5. **empty state is shown when no projects exist (conditional skip if DB seeded)**
   - Navigate to `/projects`
   - Check: `const isEmpty = (await page.locator('[data-testid="empty-state"]').count()) > 0`
   - If not empty: `test.skip()` — conditional skip if DB is seeded
   - Assert `[data-testid="empty-state"]` is visible
