# Workflows — dashboard

1. **authenticated user views all stat cards**
   - Use stored auth state (`tests/e2e/.auth/user.json`)
   - Navigate to `/dashboard`
   - Wait for `[data-testid="stat-card-projects"]` (timeout 15000ms) — Pattern 6
   - Assert all six stat cards visible: `stat-card-projects`, `stat-card-tasks`, `stat-card-completed-tasks`, `stat-card-issues`, `stat-card-sprints`, `stat-card-team`
   - Assert each card contains a numeric value

2. **activity feed and task distribution sections are rendered**
   - Navigate to `/dashboard`, wait for stat cards
   - Assert `[data-testid="activity-feed"]` is visible
   - Assert text "Task Distribution" is visible

3. **unauthenticated user is redirected to login**
   - Use fresh browser context (no auth state)
   - Navigate to `/dashboard`
   - Assert URL matches `/login`

4. **sidebar navigation from projects page reaches dashboard**
   - Navigate to `/projects`, wait for `[data-testid="project-card"]` or `[data-testid="empty-state"]`
   - Click sidebar link with text "Dashboard"
   - Assert URL matches `/dashboard`
   - Wait for `[data-testid="stat-card-projects"]`
