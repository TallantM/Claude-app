# Workflows — reports

1. **reports page loads with all four chart cards**
   - Use stored auth state
   - Navigate to `/reports`
   - Wait for `h1` (Pattern 12 — no data-testid on this page)
   - Assert "Reports & Analytics" h1 visible
   - Assert "Sprint Burndown", "Team Velocity", "Issue Distribution", "Task Completion Trend" card titles visible

2. **all four Export buttons are present and clickable**
   - Navigate to `/reports`, wait for `h1`
   - Assert four "Export" buttons are visible
   - Click first "Export" button — assert page does not navigate or crash (alert fires)

3. **reports page is accessible only when authenticated**
   - Use fresh browser context (no auth)
   - Navigate to `/reports`
   - Assert URL matches `/login`

4. **page renders without loading state (static data, no spinner)**
   - Navigate to `/reports`, wait for `h1`
   - Assert no `.animate-pulse` skeleton elements visible
   - Assert all four chart card titles visible immediately
