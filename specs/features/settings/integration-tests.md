# Integration Tests — settings

1. **GET /api/auth/session returns authenticated user data**
   - Authenticate as `tester@sdlchub.com`
   - GET `/api/auth/session`
   - Assert response contains `user.email: "tester@sdlchub.com"` and `user.name`

2. **GET /api/auth/session returns null for unauthenticated request**
   - GET `/api/auth/session` without session
   - Assert response `user` is null or response is empty

3. **PATCH /api/users/me (if implemented) updates profile name**
   - Authenticate and PATCH `/api/users/me` with `{ name: "Updated Name" }`
   - Assert response status 200
   - Assert response contains updated name (skip this scenario if endpoint not yet implemented)

4. **settings page is accessible to authenticated users**
   - Authenticate and GET `/settings`
   - Assert response status 200 (not a redirect to /login)

5. **settings page redirects unauthenticated users to login**
   - GET `/settings` without auth
   - Assert response redirects to `/login`
