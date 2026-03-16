# Notifications — Integration Test Specification

## API Routes
- `GET /api/notifications` — list notifications with pagination
- `PATCH /api/notifications` — mark notifications as read

## Scenarios

### GET /api/notifications
1. Returns paginated notifications for the authenticated user
2. Returns empty array when no notifications exist
3. Requires authentication

### PATCH /api/notifications
1. Marks specific notifications as read when `{ ids: [...] }` provided
2. Marks all notifications as read when `{ all: true }` provided
3. Requires authentication
