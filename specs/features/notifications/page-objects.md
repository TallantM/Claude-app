# Notifications — Page Object Specification

## Route
`/notifications`

## Page Object Class
`NotificationsPage` in `tests/e2e/page-objects/notifications.page.ts`

## Selectors

| Element | Selector |
|---|---|
| Page heading | `h1:has-text("Notifications")` |
| Mark all as read button | `button:has-text("Mark all as read")` |
| Notification item | `[role="button"]` (each notification row) |
| Empty state | `text=No notifications` |
| Unread indicator | `.border-l-primary` |

## Actions

### `navigate()`
- `goto("/notifications")`
- `waitForSelector('h1', { timeout: 10000 })`

### `getNotificationCount()`
- Returns count of notification row elements

### `clickNotification(index)`
- Clicks the nth notification row

### `clickMarkAllAsRead()`
- Clicks "Mark all as read" button

### `isEmptyStateVisible()`
- Returns `page.locator('text=No notifications').isVisible()`
