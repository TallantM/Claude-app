# Pipelines — Integration Test Specification

## API Routes
- `GET /api/pipelines` — list pipelines with pagination
- `POST /api/pipelines/:id/trigger` — trigger a new pipeline run

## Scenarios

### GET /api/pipelines
1. Returns paginated list of pipelines with stages and runs nested
2. Returns empty array when no pipelines exist
3. Respects `page` and `pageSize` query parameters
4. Requires authentication (returns 401 if not authenticated)

### POST /api/pipelines/:id/trigger
1. Creates a new pipeline run with status "pending"
2. Returns 404 for unknown pipeline ID
3. Requires authentication
