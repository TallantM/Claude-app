# Page Objects — repos

## ReposPage

**URL**: `/repos`
**File**: `tests/e2e/page-objects/repos.page.ts`
**Class**: `ReposPage`

### Elements

| Element | Selector | Notes |
|---------|----------|-------|
| Page heading | `h1:has-text("Repositories")` | Confirm page |
| Connect repo button | `[data-testid="connect-repo-btn"]` | Opens dialog |
| Repo cards | `[data-testid="repo-card"]` | Repeated per repo |
| Empty state | `[data-testid="empty-state"]` | When no repos |
| Connect dialog | `[role="dialog"]` with "Connect Repository" title | Modal |
| Repo name input | `#repo-name` | Inside dialog |
| Repo URL input | `#repo-url` | Inside dialog |
| Provider select | Radix Select trigger (first in dialog) | github/gitlab/bitbucket |
| Branch input | `#repo-branch` | Default branch field |
| Submit button | `button[type="submit"]:has-text("Connect Repository")` | |
| Cancel button | `button:has-text("Cancel")` inside dialog | |

### Methods

- `navigate(): Promise<void>` — goto `/repos`, wait for `[data-testid="repo-card"]` or `[data-testid="empty-state"]` (Pattern 10, 13)
- `clickConnectRepoBtn(): Promise<void>` — click `[data-testid="connect-repo-btn"]`
- `fillConnectDialog(name: string, url: string): Promise<void>` — fill name and url fields
- `submitConnectDialog(): Promise<void>` — click submit
- `cancelDialog(): Promise<void>` — click Cancel
- `getRepoCardCount(): Promise<number>` — count `[data-testid="repo-card"]`
- `isEmptyStateVisible(): Promise<boolean>` — check empty-state visibility
