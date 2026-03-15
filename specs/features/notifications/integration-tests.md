# Integration Tests — notifications

1. **GET /api/notifications returns paginated notifications list**
   - Authenticate, GET `/api/notifications`
   - Assert response status 200
   - Assert body has `data` array and `pagination` object
   - Each item has `id`, `type`, `title`, `message`, `read`, `createdAt`

2. **PATCH /api/notifications with ids marks specific notifications as read**
   - GET `/api/notifications` to find an unread notification id
   - PATCH `/api/notifications` with body `{ ids: [notificationId] }`
   - Assert response status 200
   - GET `/api/notifications` again — assert the notification now has `read: true`

3. **PATCH /api/notifications with all:true marks all as read**
   - PATCH `/api/notifications` with body `{ all: true }`
   - Assert response status 200
   - GET `/api/notifications` — assert no notifications have `read: false`

4. **GET /api/notifications returns 401 for unauthenticated request**
   - GET `/api/notifications` without session
   - Assert response status 401 or redirect

5. **PATCH /api/notifications returns 401 for unauthenticated request**
   - PATCH `/api/notifications` with `{ all: true }` without session
   - Assert response status 401 or redirect
