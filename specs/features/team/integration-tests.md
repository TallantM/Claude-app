# Team — Integration Test Specification

## API Routes
- `GET /api/team` — list team members with pagination
- `POST /api/auth/register` — invite/create new team member

## Scenarios

### GET /api/team
1. Returns paginated list of users with name, email, role, image
2. Returns empty array when no users beyond the current user exist
3. Requires authentication (returns 401 if not authenticated)

### POST /api/auth/register (used for inviting)
1. Creates a new user with provided name, email, password "changeme123"
2. Returns 409 if email already exists
3. Returns 400 for missing required fields
