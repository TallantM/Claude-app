# Unit Tests — authentication

1. **renders login form with email, password fields and Sign in button**
   - Render `LoginPage`
   - Assert `#email`, `#password`, and `button[type="submit"]` with text "Sign in" are present
   - Assert no `[role="alert"]` is visible

2. **submits credentials to signIn with correct arguments**
   - Mock `signIn` to return `{ error: null }`
   - Type `tester@sdlchub.com` / `test1234`, click Submit
   - Assert `signIn` called with `"credentials"`, `{ email, password, redirect: false }`

3. **shows "Invalid email or password" when signIn returns an error**
   - Mock `signIn` to return `{ error: "CredentialsSignin" }`
   - Submit valid credentials
   - Assert `[role="alert"]:not(#__next-route-announcer__)` contains "Invalid email or password"

4. **redirects to /dashboard and calls router.refresh on success**
   - Mock `signIn` to return `{ error: null }`
   - Mock `useRouter` with `{ push: vi.fn(), refresh: vi.fn() }`
   - Submit credentials
   - Assert `router.push("/dashboard")` and `router.refresh()` called

5. **disables submit button and shows spinner while login is in progress**
   - Mock `signIn` with a never-resolving promise
   - Submit form
   - Assert submit button is disabled and Loader2 spinner is in the document

6. **renders register form with name, email, password, confirmPassword fields**
   - Render `RegisterPage`
   - Assert `#name`, `#email`, `#password`, `#confirmPassword` inputs and "Create account" button are present

7. **calls POST /api/auth/register with correct body on valid submission**
   - Mock `fetch` to return `{ ok: true }`
   - Fill all fields with valid data and submit
   - Assert `fetch` called with `"/api/auth/register"`, method POST, body containing name/email/password

8. **redirects to /login?registered=true after successful registration**
   - Mock `fetch` to return `{ ok: true }`
   - Mock `useRouter` with `{ push: vi.fn() }`
   - Submit valid registration form
   - Assert `router.push("/login?registered=true")` called

9. **shows server error message when registration API returns error**
   - Mock `fetch` to return `{ ok: false, json: async () => ({ error: "Email already in use" }) }`
   - Submit valid form
   - Assert `[role="alert"]:not(#__next-route-announcer__)` contains "Email already in use"

10. **shows register link on login page and login link on register page**
    - Render `LoginPage` — assert `a[href="/register"]` is present
    - Render `RegisterPage` — assert `a[href="/login"]` is present
