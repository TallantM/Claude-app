# Integration Tests — projects

1. **GET /api/projects returns paginated list with data array**
   - Authenticate, GET `/api/projects`
   - Assert response status 200
   - Assert body has `data` array and `pagination` object with `total`, `page`, `pageSize`

2. **GET /api/projects?status=active returns only active projects**
   - GET `/api/projects?status=active`
   - Assert all returned projects have `status: "active"`

3. **POST /api/projects creates a new project and returns it**
   - POST `/api/projects` with `{ name: "Integration Test Project", key: "ITP", status: "active" }`
   - Assert response status 200 or 201
   - Assert response body contains `id` and `name: "Integration Test Project"`

4. **POST /api/projects with missing name returns 400**
   - POST `/api/projects` with `{ key: "BAD" }` (no name)
   - Assert response status 400
   - Assert error message in response body

5. **GET /api/projects/{id} returns project with tasks and sprints**
   - Get a project id from the seed data
   - GET `/api/projects/{id}`
   - Assert response contains `project` or project fields plus `tasks` and `sprints` arrays
