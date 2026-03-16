# Team — Page Object Specification

## Route
`/team`

## Page Object Class
`TeamPage` in `tests/e2e/page-objects/team.page.ts`

## Selectors

| Element | Selector |
|---|---|
| Page heading | `h1:has-text("Team Management")` |
| Invite Member button | `button:has-text("Invite Member")` |
| Member card | `[data-testid="member-card"]` |
| Empty state | `[data-testid="empty-state"]` |
| Invite dialog | `[role="dialog"]` |
| Full Name input | `#inv-name` |
| Email input | `#inv-email` |
| Send Invite button | `button:has-text("Send Invite")` |
| Cancel button | `button:has-text("Cancel")` |

## Actions

### `navigate()`
- `goto("/team")`
- `waitForSelector('[data-testid="member-card"], [data-testid="empty-state"], h1', { timeout: 10000 })`

### `clickInviteMember()`
- Clicks "Invite Member" button

### `getMemberCardCount()`
- Returns `page.locator('[data-testid="member-card"]').count()`

### `inviteMember(name, email)`
- Clicks Invite Member
- Fills name and email
- Clicks Send Invite
- Waits for dialog to close
