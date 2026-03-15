# Integration Tests — team

1. **GET /api/team returns paginated team members**
   - Authenticate, GET `/api/team`
   - Assert response status 200
   - Assert body has `data` array and `pagination` object
   - Assert each member has `id`, `name`, `email`, `role`

2. **GET /api/team returns seeded members with non-zero count**
   - GET `/api/team`
   - Assert `data.length > 0` (seed provides at least one member)

3. **POST /api/auth/register creates a new user viewable in /api/team**
   - POST `/api/auth/register` with unique email/name/password
   - GET `/api/team` and assert the new user appears in the list

4. **GET /api/team returns 401 for unauthenticated request**
   - GET `/api/team` without session
   - Assert response status 401 or redirect

5. **team members have expected role values**
   - GET `/api/team`
   - Assert all returned member `role` values are one of: `admin`, `developer`, `project_manager`, `tester`, `viewer`
