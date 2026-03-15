# Workflows — authentication

1. **successful login navigates to dashboard**
   - Navigate to `/login`
   - Fill email `tester@sdlchub.com`, password `test1234`
   - Click "Sign in"
   - Assert URL matches `/dashboard`
   - Assert `[data-testid="stat-card-projects"]` is visible (wait up to 15000ms)

2. **invalid credentials shows error message**
   - Navigate to `/login`
   - Fill email `bad@example.com`, password `wrongpass`
   - Click "Sign in"
   - Assert `[role="alert"]:not(#__next-route-announcer__)` contains "Invalid email or password"
   - Assert URL still matches `/login`

3. **unauthenticated access to /dashboard redirects to login**
   - Use fresh browser context (no stored auth)
   - Navigate to `/dashboard`
   - Assert URL matches `/login`

4. **new user registration then login reaches dashboard**
   - Navigate to `/register`
   - Fill name, unique email (`e2e-${Date.now().toString().slice(-5)}@example.com`), password `test1234`, confirm `test1234`
   - Click "Create account"
   - Assert URL matches `/login`
   - Log in with the new credentials
   - Assert URL matches `/dashboard`

5. **sign-out via Radix dropdown returns to login**
   - Use stored auth state (`tests/e2e/.auth/user.json`)
   - Navigate to `/dashboard`, wait for `[data-testid="stat-card-projects"]`
   - Click `header button:has([data-slot="avatar"])`
   - Wait for `[role="menu"]`
   - Click `[role="menuitem"]:has-text("Sign out")`
   - Assert URL matches `/login` (timeout 10000ms)
