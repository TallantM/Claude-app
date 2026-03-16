# Notifications — Unit Test Specification

## Test File
`tests/unit/notifications-page.test.tsx`

## Mocks Required
- `next/navigation` → `useRouter`, `useSearchParams`, `usePathname`
- `global.fetch` → mock paginated API response

## Mock Data Shape
```typescript
{
  data: [{
    id: "n1",
    type: "task_assigned",
    title: "Task assigned to you",
    message: "You have been assigned Fix login bug",
    read: false,
    link: "/projects/p1",
    createdAt: "2026-01-01T00:00:00Z"
  }, {
    id: "n2",
    type: "comment_added",
    title: "New comment",
    message: "Alice commented on your task",
    read: true,
    link: null,
    createdAt: "2026-01-02T00:00:00Z"
  }],
  pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 }
}
```

## Test Scenarios

1. **renders page heading and notification items**
   - Given: fetch resolves with two notifications
   - Then: "Notifications" heading visible; "Task assigned to you" and "New comment" are visible

2. **shows empty state when no notifications exist**
   - Given: fetch resolves with empty data array
   - Then: "No notifications" text is visible

3. **shows loading skeleton while data is loading**
   - Given: fetch never resolves
   - Then: skeleton elements are in DOM; notification titles are not

4. **shows unread count in subtitle**
   - Given: one unread notification
   - Then: "1 unread" text is visible in the subtitle area

5. **shows all caught up when no unread notifications**
   - Given: all notifications are read
   - Then: "All caught up" text is visible

6. **shows Mark all as read button when unread notifications exist**
   - Given: at least one unread notification
   - Then: "Mark all as read" button is visible

7. **hides Mark all as read button when all notifications are read**
   - Given: all notifications have read: true
   - Then: "Mark all as read" button is not in the DOM

8. **clicking a notification calls PATCH /api/notifications**
   - Given: an unread notification is rendered
   - When: the notification row is clicked
   - Then: fetch is called with PATCH method and `{ ids: ["n1"] }`

9. **clicking Mark all as read calls PATCH with { all: true }**
   - Given: unread notifications exist; "Mark all as read" button visible
   - When: button is clicked
   - Then: fetch is called with PATCH method and `{ all: true }`

10. **optimistic read update — notification loses unread styling after click**
    - Given: unread notification with `.border-l-primary` class
    - When: clicked
    - Then: notification no longer has unread styling (border-l-primary removed)
