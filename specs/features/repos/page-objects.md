# Repos — Page Object Specification

## Route
`/repos`

## Page Object Class
`ReposPage` in `tests/e2e/page-objects/repos.page.ts`

## Selectors

| Element | Selector |
|---|---|
| Page heading | `h1:has-text("Repositories")` |
| Connect Repository button | `[data-testid="connect-repo-btn"]` |
| Repo card | `[data-testid="repo-card"]` |
| Empty state | `[data-testid="empty-state"]` |
| Connect dialog | `[role="dialog"]` |
| Repo Name input | `#repo-name` |
| Repo URL input | `#repo-url` |
| Default Branch input | `#repo-branch` |
| Connect Repository submit | `button[type="submit"]:has-text("Connect Repository")` |

## Actions

### `navigate()`
- `goto("/repos")`
- `waitForSelector('[data-testid="repo-card"], [data-testid="empty-state"], h1', { timeout: 10000 })`

### `clickConnectRepo()`
- Clicks `[data-testid="connect-repo-btn"]`

### `getRepoCardCount()`
- Returns count of `[data-testid="repo-card"]`

### `connectRepo(name, url)`
- Opens dialog
- Fills name and URL
- Clicks submit
- Waits for dialog to close
