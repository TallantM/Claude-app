# Repos — E2E Workflow Specification

## Test File
`tests/e2e/repos.spec.ts`

## Auth
All tests use `storageState: ".auth/user.json"` (authenticated user).

## Workflows

1. **loads the repos page with heading and Connect Repository button**
   - Navigate to `/repos`
   - Assert: `h1` with "Repositories" is visible
   - Assert: "Connect Repository" button visible
   - Assert: URL is `/repos`

2. **shows repo cards or empty state (seed-aware)**
   - Navigate to `/repos`
   - Assert: either `[data-testid="repo-card"]` OR `[data-testid="empty-state"]` visible

3. **opens Connect Repository dialog on button click**
   - Navigate to `/repos`
   - Click "Connect Repository" button
   - Assert: dialog with "Connect Repository" title visible
   - Assert: form fields (name, URL) are present

4. **closes dialog on Cancel**
   - Navigate to `/repos`
   - Open dialog
   - Click "Cancel"
   - Assert: dialog no longer visible

5. **connects a new repository successfully**
   - Navigate to `/repos`
   - Open dialog
   - Fill repo name with unique value, URL with valid GitHub URL
   - Submit form
   - Assert: dialog closes; new repo card visible in list

6. **shows validation error for invalid URL**
   - Navigate to `/repos`
   - Open dialog
   - Fill repo name but enter invalid URL (e.g., "not-a-url")
   - Click submit
   - Assert: validation error visible; dialog remains open
