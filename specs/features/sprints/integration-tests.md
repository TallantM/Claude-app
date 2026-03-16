# Sprints — Integration Test Specification

## API Routes
- `GET /api/projects/:id` — returns project with nested sprints and tasks
- Sprint management is done through project detail API

## Scenarios

### GET /api/projects/:id
1. Returns project with `sprints` array containing sprint name, status, goal, tasks
2. Returns 404 for non-existent project ID
3. Requires authentication

### Sprint data shape
- `id`, `name`, `status` (planning/active/completed), `goal`, `startDate`, `endDate`
- Nested `tasks` array
