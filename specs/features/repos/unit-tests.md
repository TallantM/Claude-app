# Repos — Unit Test Specification

## Test File
`tests/unit/repos-page.test.tsx`

## Mocks Required
- `next/navigation` → `useRouter`, `useSearchParams`, `usePathname`
- `global.fetch` → mock for `/api/repos` and `/api/projects`

## Mock Data Shape (repos)
```typescript
{
  data: [{
    id: "r1",
    name: "my-app",
    url: "https://github.com/org/my-app",
    provider: "github",
    projectId: "p1",
    defaultBranch: "main",
    createdAt: "2026-01-01T00:00:00Z",
    project: { id: "p1", name: "Alpha", key: "AL" }
  }]
}
```

## Test Scenarios

1. **renders heading and Connect Repository button**
   - Given: fetch resolves with repos
   - Then: "Repositories" heading and "Connect Repository" button visible

2. **renders repo cards after data loads**
   - Given: fetch resolves with one repo
   - Then: "my-app" card is visible with GitHub badge

3. **shows empty state when no repos exist**
   - Given: fetch resolves with empty repos array
   - Then: `[data-testid="empty-state"]` visible with "No repositories connected"

4. **shows loading skeleton while data is loading**
   - Given: fetch never resolves
   - Then: `.animate-pulse` skeleton present; no repo cards

5. **shows error state when fetch fails**
   - Given: fetch resolves with `{ ok: false }`
   - Then: "Error loading repositories" text visible

6. **opens Connect Repository dialog on button click**
   - Given: page loaded
   - When: "Connect Repository" button clicked
   - Then: dialog with "Connect Repository" title and form fields visible

7. **closes dialog on Cancel click**
   - Given: dialog open
   - When: "Cancel" button clicked
   - Then: dialog closed

8. **Connect Repository submit button has type="submit"**
   - Given: dialog open
   - Then: submit button has `type="submit"` and is inside a `<form>`

9. **renders repo URL as a link**
   - Given: repo card with URL
   - Then: an anchor tag with the URL is visible in the card

10. **renders default branch information**
    - Given: repo card with defaultBranch "main"
    - Then: "main" branch text visible in card
