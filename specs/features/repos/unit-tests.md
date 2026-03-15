# Unit Tests — repos

1. **shows loading skeleton while fetch is pending**
   - Mock both `fetch` calls (repos + projects) with never-resolving promises
   - Render `ReposPage`
   - Assert animate-pulse skeleton elements visible
   - Assert no `[data-testid="repo-card"]` rendered

2. **renders repo cards after data loads**
   - Mock `fetch` for `/api/repos` to return `{ data: [{ id: "1", name: "my-app", url: "https://github.com/org/my-app", provider: "github", projectId: null, defaultBranch: "main", createdAt: "2026-01-01T00:00:00Z" }] }`
   - Mock `fetch` for `/api/projects` to return `{ data: [] }`
   - Assert `[data-testid="repo-card"]` visible
   - Assert "my-app" text in document

3. **shows empty state when no repos connected**
   - Mock `/api/repos` to return `{ data: [] }` and `/api/projects` to return `{ data: [] }`
   - Assert `[data-testid="empty-state"]` visible
   - Assert "No repositories connected" text shown

4. **opens connect repo dialog when button clicked**
   - Mock fetch with empty repos
   - Click `[data-testid="connect-repo-btn"]`
   - Assert dialog with "Connect Repository" heading visible
   - Assert `#repo-name` input present

5. **connect repo dialog has submit button inside a form (structural assertion)**
   - Open dialog
   - Get submit button by role with name `/connect repository/i`
   - Assert `type="submit"`
   - Assert `closest("form")` not null
   - Assert `document.getElementById("repo-name")` has `name="name"` — Pattern 7

6. **cancel button closes the dialog**
   - Open dialog, click Cancel
   - Assert "Connect Repository" heading no longer in document

7. **repo card shows GitHub badge for github provider**
   - Mock fetch with a repo where `provider: "github"`
   - Assert "GitHub" badge text visible in the card

8. **repo card shows GitLab badge for gitlab provider**
   - Mock fetch with `provider: "gitlab"`
   - Assert "GitLab" badge text visible

9. **repo card shows default branch when present**
   - Mock fetch with `defaultBranch: "develop"`
   - Assert "develop" text visible in the card

10. **shows error state when fetch rejects**
    - Mock `/api/repos` fetch to throw
    - Assert "Error loading repositories" visible
