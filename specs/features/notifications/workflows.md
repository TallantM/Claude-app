# Notifications — E2E Workflow Specification

## Test File
`tests/e2e/notifications.spec.ts`

## Auth
All tests use `storageState: ".auth/user.json"` (authenticated user).

## Workflows

1. **loads the notifications page with heading**
   - Navigate to `/notifications`
   - Assert: `h1` with "Notifications" is visible
   - Assert: URL is `/notifications`

2. **shows notification list or empty state (seed-aware)**
   - Navigate to `/notifications`
   - Assert: either notifications list OR "No notifications" empty state is visible

3. **clicking a notification marks it as read optimistically**
   - Navigate to `/notifications`
   - Skip if empty state visible
   - Find the first unread notification (has `.border-l-primary`)
   - Click it
   - Assert: the notification no longer has unread styling

4. **Mark all as read button removes unread styling**
   - Navigate to `/notifications`
   - Skip if no "Mark all as read" button visible
   - Click "Mark all as read"
   - Assert: button disappears; subtitle shows "All caught up"

5. **page renders without crashes with various notification types**
   - Navigate to `/notifications`
   - Assert: page title "Notifications" is visible with no JS errors
