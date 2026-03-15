# Unit Tests — notifications

1. **shows loading skeletons while fetch is pending**
   - Mock `fetch` with never-resolving promise
   - Render `NotificationsPage`
   - Assert Skeleton elements visible (5 skeleton cards)
   - Assert no notification items rendered

2. **renders notification items after data loads**
   - Mock `fetch` to return `{ data: [{ id: "1", type: "task_assigned", title: "Task assigned", message: "You have a new task", read: false, link: null, createdAt: "2026-01-01T00:00:00Z" }], pagination: { total: 1, page: 1, pageSize: 20, totalPages: 1 } }`
   - Assert "Notifications" heading visible
   - Assert "Task assigned" text in document

3. **shows "No notifications" empty state when list is empty**
   - Mock `fetch` to return `{ data: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 } }`
   - Assert "No notifications" text visible

4. **unread count is shown in subtitle when unread notifications exist**
   - Mock `fetch` with 2 unread notifications (`read: false`) and 1 read
   - Assert "2 unread" text visible in the page subtitle

5. **shows "All caught up" subtitle when all notifications are read**
   - Mock `fetch` with all notifications having `read: true`
   - Assert "All caught up" text visible (no unread badge)

6. **Mark all as read button is visible when unread notifications exist**
   - Mock `fetch` with at least one unread notification
   - Assert `button:has-text("Mark all as read")` is visible

7. **Mark all as read button is NOT visible when all notifications are read**
   - Mock `fetch` with all `read: true`
   - Assert "Mark all as read" button is not in the document

8. **clicking an unread notification calls PATCH /api/notifications**
   - Mock `fetch` with one unread notification; mock PATCH to return ok
   - Click the notification item
   - Assert `fetch` called with PATCH to `/api/notifications` with body `{ ids: ["1"] }`

9. **clicking "Mark all as read" calls PATCH /api/notifications with all:true**
   - Mock `fetch` with unread notifications; mock PATCH
   - Click "Mark all as read" button
   - Assert `fetch` called with PATCH body `{ all: true }`

10. **unread notification renders with bold title and primary left border**
    - Mock `fetch` with one unread notification
    - Assert the notification element has the `font-semibold` class on the title
    - Assert the container has `border-l-primary` class (indicating unread styling)
