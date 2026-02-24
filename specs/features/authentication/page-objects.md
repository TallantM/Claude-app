# Authentication Page Objects Specification

## Page Overview: LoginPage

**Page Name**: LoginPage
**URL**: `/login`
**Purpose**: Email/password login form + OAuth (GitHub, Google) sign-in buttons.
**Class**: `LoginPage`

### What It Does
Wraps the login page so tests can navigate to it, fill in credentials, submit the form,
and read the resulting error message — without knowing anything about selectors.

---

## Page Elements

| Element | Selector | Type | Purpose |
|---------|----------|------|---------|
| Email input | `#email` | Input (email) | Enter the user's email address |
| Password input | `#password` | Input (password) | Enter the user's password |
| Submit button | `button[type="submit"]` | Button | Submit the login form |
| Error alert | `[role="alert"]` | Div | Shows "Invalid email or password" on failure |
| GitHub OAuth button | `button:has-text("GitHub")` | Button | Initiate GitHub OAuth flow |
| Google OAuth button | `button:has-text("Google")` | Button | Initiate Google OAuth flow |
| Register link | `a[href="/register"]` | Link | Navigate to registration page |
| Page heading | `h2:has-text("Welcome back")` | Heading | Confirms this is the login page |

### Selector Strategy
Prefer `#id` selectors (stable) and `role="alert"` for error messages.
Use `button:has-text(...)` for OAuth buttons that lack IDs.

---

## Methods

### navigateTo
**Signature**: `Promise<void> navigateTo()`
**What it does**: Navigates the browser to `/login`.
**Behavior**: Goes to the login page and waits for it to be ready.

---

### login
**Signature**: `Promise<void> login(email: string, password: string)`
**What it does**: Fills email and password fields and clicks the sign-in button.
**Parameters**:
- `email` (string): The email address to type
- `password` (string): The password to type
**Behavior**: Fills both inputs, then clicks `button[type="submit"]`.

---

### getErrorMessage
**Signature**: `Promise<string | null> getErrorMessage()`
**What it does**: Returns the text of the error alert, or null if no error is visible.
**Returns**: Error text like "Invalid email or password", or null if not shown.

---

### isErrorVisible
**Signature**: `Promise<boolean> isErrorVisible()`
**What it does**: Checks whether the error alert is visible.
**Returns**: `true` if an error is shown, `false` otherwise.

---

### clickRegisterLink
**Signature**: `Promise<void> clickRegisterLink()`
**What it does**: Clicks the "Sign up" link to go to the registration page.

---

## Page Overview: RegisterPage

**Page Name**: RegisterPage
**URL**: `/register`
**Purpose**: New user registration form with name, email, password, and confirm password.
**Class**: `RegisterPage`

### What It Does
Wraps the registration page so tests can fill the form, submit it, and verify success
or error conditions.

---

## Page Elements

| Element | Selector | Type | Purpose |
|---------|----------|------|---------|
| Name input | `#name` | Input (text) | Full name field |
| Email input | `#email` | Input (email) | Email address field |
| Password input | `#password` | Input (password) | Password field |
| Confirm password | `#confirmPassword` | Input (password) | Repeat password field |
| Submit button | `button[type="submit"]` | Button | Submit registration form |
| Error alert | `[role="alert"]` | Div | Shows registration errors |
| Login link | `a[href="/login"]` | Link | Navigate back to login |
| Page heading | `h2:has-text("Create an account")` | Heading | Confirms this is register page |

---

## Methods

### navigateTo
**Signature**: `Promise<void> navigateTo()`
**What it does**: Navigates to `/register`.

---

### register
**Signature**: `Promise<void> register(name: string, email: string, password: string, confirmPassword: string)`
**What it does**: Fills all fields and submits the registration form.
**Parameters**:
- `name` (string): Full name
- `email` (string): Email address
- `password` (string): Password (min 8 characters)
- `confirmPassword` (string): Must match password
**Behavior**: Fills all four inputs, then clicks `button[type="submit"]`.

---

### getErrorMessage
**Signature**: `Promise<string | null> getErrorMessage()`
**What it does**: Returns error text if the alert is visible, null otherwise.

---

### clickLoginLink
**Signature**: `Promise<void> clickLoginLink()`
**What it does**: Clicks the "Sign in" link to go back to the login page.

---

## Implementation Rules

**Constructor**: `constructor(private readonly page: Page)`

**Methods**:
- All async (return `Promise<void>` or `Promise<T>`)
- All Playwright calls use `await`
- No assertions in Page Objects — only actions and queries

**File Locations**:
- `tests/e2e/page-objects/login.page.ts` → `LoginPage`
- `tests/e2e/page-objects/register.page.ts` → `RegisterPage`
