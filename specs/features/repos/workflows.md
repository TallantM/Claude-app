# Workflows — repos

1. **repos page loads and shows repo cards or empty state**
   - Use stored auth state
   - Navigate to `/repos`
   - Wait for `[data-testid="repo-card"]` or `[data-testid="empty-state"]`
   - Assert either at least one `[data-testid="repo-card"]` or empty state is visible
   - Assert `[data-testid="connect-repo-btn"]` is visible

2. **connect new repository via dialog**
   - Navigate to `/repos`, wait for page to settle (Pattern 13)
   - Click `[data-testid="connect-repo-btn"]`
   - Assert "Connect Repository" dialog visible
   - Fill `#repo-name` with unique name `e2e-repo-${suffix}` (Pattern 5)
   - Fill `#repo-url` with `https://github.com/org/e2e-repo-${suffix}`
   - Click "Connect Repository"
   - Wait for dialog to close
   - Assert new repo name visible in grid

3. **empty state renders when no repos connected (conditional skip if DB seeded)**
   - Navigate to `/repos`
   - Check: `const isEmpty = (await page.locator('[data-testid="empty-state"]').count()) > 0`
   - If not empty: `test.skip()` — conditional skip if DB is seeded
   - Assert `[data-testid="empty-state"]` visible

4. **repo card displays provider badge and branch info**
   - Navigate to `/repos`, wait for `[data-testid="repo-card"]`
   - Assert first card contains a provider badge (GitHub, GitLab, or Bitbucket text)

5. **cancel button dismisses the connect dialog without creating repo**
   - Navigate to `/repos`
   - Click `[data-testid="connect-repo-btn"]`
   - Assert dialog visible
   - Click Cancel
   - Assert dialog no longer visible
