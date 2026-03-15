# Page Objects — notifications

## NotificationsPage

**URL**: `/notifications`
**File**: `tests/e2e/page-objects/notifications.page.ts`
**Class**: `NotificationsPage`

### Notes on Selectors

This page has **no `data-testid` attributes**. Wait for `h1` as the load indicator (Pattern 12).

### Elements

| Element | Selector | Notes |
|---------|----------|-------|
| Page heading | `h1:has-text("Notifications")` | Load indicator (Pattern 12) |
| Subtitle | `p.text-muted-foreground` near h1 | "X unread" or "All caught up" |
| Notification items | `div[role="button"]` in list | Each notification row |
| Unread item | `.border-l-4.border-l-primary` | Unread styling |
| Mark all read btn | `button:has-text("Mark all as read")` | Only shown when unread exist |
| Empty state | `p:has-text("No notifications")` | When list is empty |

### Methods

- `navigate(): Promise<void>` — goto `/notifications`, wait for `h1` with timeout 10000ms (Pattern 12)
- `getNotificationCount(): Promise<number>` — count `div[role="button"]` notification items
- `getUnreadCount(): Promise<number>` — count `.border-l-4.border-l-primary` items
- `clickFirstNotification(): Promise<void>` — click first notification item
- `clickMarkAllAsRead(): Promise<void>` — click "Mark all as read" button
- `isMarkAllReadVisible(): Promise<boolean>` — check if "Mark all as read" button is visible
- `getSubtitleText(): Promise<string>` — get text of subtitle paragraph
