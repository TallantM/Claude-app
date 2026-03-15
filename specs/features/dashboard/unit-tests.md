# Unit Tests — dashboard

1. **shows loading skeleton while fetch is pending**
   - Mock `fetch` with a never-resolving promise
   - Render `DashboardPage`
   - Assert animate-pulse skeleton elements are present
   - Assert stat card content is NOT visible

2. **renders all six stat cards after successful data fetch**
   - Mock `fetch` to return `{ data: { stats: { totalProjects: 5, totalTasks: 42, completedTasks: 18, openIssues: 7, activeSprints: 2, teamMembers: 8 }, recentActivity: [], taskDistribution: [] } }`
   - Wait for `[data-testid="stat-card-projects"]`
   - Assert all six testids present: `stat-card-projects`, `stat-card-tasks`, `stat-card-completed-tasks`, `stat-card-issues`, `stat-card-sprints`, `stat-card-team`

3. **displays correct numeric values from API response**
   - Mock `fetch` with the stats payload above
   - Assert text "5" appears in the projects card, "42" in tasks card, etc.

4. **renders activity feed card and shows activity items**
   - Mock `fetch` with `recentActivity: [{ id: "1", type: "created", entity: "task", details: "Fix login bug", createdAt: "2026-01-01T00:00:00Z", user: { name: "Alice", image: null } }]`
   - Assert `[data-testid="activity-feed"]` is in the document
   - Assert "Fix login bug" text is visible

5. **shows "No recent activity" when recentActivity array is empty**
   - Mock `fetch` with `recentActivity: []`
   - Assert text "No recent activity" is visible

6. **renders task distribution bars for all four statuses**
   - Mock `fetch` with `taskDistribution: [{ label: "todo", value: 10 }, { label: "in_progress", value: 5 }, { label: "in_review", value: 2 }, { label: "done", value: 8 }]`
   - Assert `[data-testid="task-dist-todo"]`, `[data-testid="task-dist-in-progress"]`, `[data-testid="task-dist-in_review"]`, `[data-testid="task-dist-done"]` are present

7. **calculates completion rate correctly**
   - Mock stats with `totalTasks: 10, completedTasks: 4`
   - Assert text "40%" is visible in the page

8. **shows 0% completion rate when totalTasks is zero**
   - Mock stats with `totalTasks: 0, completedTasks: 0`
   - Assert text "0%" is visible

9. **shows error state when fetch rejects**
   - Mock `fetch` to throw `new Error("Network error")`
   - Assert "Error loading dashboard" is visible
   - Assert "Network error" detail text is visible

10. **calls /api/dashboard on mount**
    - Mock `fetch` with valid payload
    - Render `DashboardPage`
    - Assert `fetch` called with `"/api/dashboard"`
