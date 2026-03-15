# Integration Tests — dashboard

1. **GET /api/dashboard returns stats object with all required keys**
   - Authenticate as `tester@sdlchub.com`
   - GET `/api/dashboard`
   - Assert response status 200
   - Assert body contains `stats` with keys: `totalProjects`, `totalTasks`, `completedTasks`, `openIssues`, `activeSprints`, `teamMembers`

2. **GET /api/dashboard returns recentActivity array**
   - Authenticate and GET `/api/dashboard`
   - Assert `recentActivity` is an array
   - If seeded: assert array length > 0

3. **GET /api/dashboard returns taskDistribution array with four status labels**
   - GET `/api/dashboard`
   - Assert `taskDistribution` array contains entries for `todo`, `in_progress`, `in_review`, `done`

4. **GET /api/dashboard returns 401 for unauthenticated request**
   - GET `/api/dashboard` without auth header/session
   - Assert response status 401 or redirect to login

5. **stat card counts are consistent with underlying data tables**
   - GET `/api/dashboard` and record `totalProjects`
   - GET `/api/projects?pageSize=100` and count returned items
   - Assert counts are equal (or dashboard count matches `toBeGreaterThan(0)`)
