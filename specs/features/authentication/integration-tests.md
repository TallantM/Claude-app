# Integration Tests — authentication

1. **POST /api/auth/register creates a new user and returns 201**
   - POST `/api/auth/register` with `{ name: "Test User", email: "new-{ts}@example.com", password: "test1234" }`
   - Assert response status 200 or 201
   - Assert response body contains user id or success indicator

2. **POST /api/auth/register with duplicate email returns error**
   - POST `/api/auth/register` with `{ email: "tester@sdlchub.com", ... }`
   - Assert response status 400 or 409
   - Assert response body contains an error field

3. **POST /api/auth/callback/credentials with valid creds returns session**
   - Authenticate via NextAuth credentials provider with `tester@sdlchub.com` / `test1234`
   - Assert session is returned (cookie set or token issued)

4. **POST /api/auth/callback/credentials with invalid creds returns 401**
   - POST credentials with `bad@example.com` / `wrongpass`
   - Assert authentication fails (error response or redirect to `/login?error=...`)

5. **GET /api/auth/session returns user data for authenticated session**
   - Authenticate as tester, then GET `/api/auth/session`
   - Assert response contains `user.email: "tester@sdlchub.com"`
