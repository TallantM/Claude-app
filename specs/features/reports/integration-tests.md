# Integration Tests — reports

1. **reports page is accessible to authenticated users**
   - Authenticate as `tester@sdlchub.com`
   - GET `/reports`
   - Assert response status 200 (not a redirect)

2. **reports page redirects unauthenticated users to login**
   - GET `/reports` without auth
   - Assert response redirects to `/login`

3. **reports page HTML contains all four chart card titles**
   - Authenticate and GET `/reports`
   - Assert response body contains "Sprint Burndown", "Team Velocity", "Issue Distribution", "Task Completion Trend"

4. **no API data endpoints are called by the reports page (static data)**
   - The reports page uses hardcoded mock datasets — verify this by confirming no `/api/` calls are made for chart data
   - Navigate to `/reports` as authenticated user
   - Assert page renders all four charts without network errors in browser console
