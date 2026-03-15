# Integration Tests — pipelines

1. **GET /api/pipelines returns paginated list**
   - Authenticate, GET `/api/pipelines`
   - Assert response status 200
   - Assert body has `data` array and `pagination` object

2. **GET /api/pipelines returns pipelines with stages and runs arrays**
   - GET `/api/pipelines`
   - For first item in `data`, assert `stages` is an array and `runs` is an array

3. **POST /api/pipelines/{id}/trigger creates a new run**
   - Get a seeded pipeline id
   - POST `/api/pipelines/{id}/trigger`
   - Assert response status 200 or 201
   - Assert response body contains a run object with a `status` field

4. **GET /api/pipelines returns 401 for unauthenticated request**
   - GET `/api/pipelines` without session
   - Assert response status 401 or redirect

5. **pipeline runs are ordered by most recent first**
   - GET `/api/pipelines`
   - For a pipeline with multiple runs, assert `runs[0].startedAt` is later than or equal to `runs[1].startedAt` (if two runs exist)
