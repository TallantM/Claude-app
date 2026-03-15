# Workflows — notifications

1. **notifications page loads and shows notification items or empty state**
   - Use stored auth state
   - Navigate to `/notifications`
   - Wait for `h1` (Pattern 12 — no data-testid on this page)
   - Assert "Notifications" h1 visible
   - Assert notification items or "No notifications" empty state present

2. **mark single notification as read by clicking it**
   - Navigate to `/notifications`, wait for `h1`
   - If any unread notification exists (has `border-l-4` class), click it
   - Assert the clicked notification no longer shows unread styling (border removed)

3. **"Mark all as read" button marks all notifications as read**
   - Navigate to `/notifications`, wait for `h1`
   - If `button:has-text("Mark all as read")` is visible, click it
   - Assert "Mark all as read" button disappears
   - Assert subtitle shows "All caught up"

4. **empty state renders when no notifications exist (conditional skip if DB seeded)**
   - Navigate to `/notifications`, wait for `h1`
   - Check count of notification items
   - If any items exist: `test.skip()` — conditional skip if DB is seeded
   - Assert "No notifications" text visible
