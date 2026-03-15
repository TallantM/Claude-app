# Integration Tests — issues

1. **GET /api/issues returns paginated issues list**
   - Authenticate, GET `/api/issues`
   - Assert response status 200
   - Assert body has `data` array and `pagination` object

2. **GET /api/issues?status=open returns only open issues**
   - GET `/api/issues?status=open`
   - Assert all returned issues have `status: "open"`

3. **POST /api/issues creates a new issue and returns it**
   - Get a seeded project id
   - POST `/api/issues` with `{ title: "Integration Test Bug", status: "open", severity: "medium", type: "bug", projectId }`
   - Assert response status 200 or 201
   - Assert response body contains `id` and `title: "Integration Test Bug"`

4. **POST /api/issues with missing title returns 400**
   - POST `/api/issues` with `{ status: "open" }` (no title)
   - Assert response status 400

5. **GET /api/issues?severity=critical returns only critical issues**
   - GET `/api/issues?severity=critical`
   - Assert all returned issues have `severity: "critical"` (or empty array if none seeded)
