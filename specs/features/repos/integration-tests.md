# Integration Tests — repos

1. **GET /api/repos returns repos list**
   - Authenticate, GET `/api/repos`
   - Assert response status 200
   - Assert body has `data` array

2. **POST /api/repos creates a new repository**
   - POST `/api/repos` with `{ name: "integration-repo", url: "https://github.com/org/integration-repo", provider: "github", defaultBranch: "main" }`
   - Assert response status 200 or 201
   - Assert response body contains `id` and `name: "integration-repo"`

3. **POST /api/repos with invalid URL returns 400**
   - POST `/api/repos` with `{ name: "bad", url: "not-a-url", provider: "github" }`
   - Assert response status 400
   - Assert error field in body

4. **GET /api/repos returns 401 for unauthenticated request**
   - GET `/api/repos` without session
   - Assert response status 401 or redirect

5. **POST /api/repos with missing name returns 400**
   - POST `/api/repos` with `{ url: "https://github.com/org/repo", provider: "github" }` (no name)
   - Assert response status 400
