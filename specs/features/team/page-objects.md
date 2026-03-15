# Page Objects — team

## TeamPage

**URL**: `/team`
**File**: `tests/e2e/page-objects/team.page.ts`
**Class**: `TeamPage`

### Elements

| Element | Selector | Notes |
|---------|----------|-------|
| Page heading | `h1:has-text("Team Management")` | Confirm page |
| Member cards | `[data-testid="member-card"]` | Repeated per member |
| Empty state | `[data-testid="empty-state"]` | When no members |
| Invite button | `button:has-text("Invite Member")` | Opens dialog |
| Invite dialog | `[role="dialog"]` with "Invite Team Member" title | Modal |
| Name input | `#inv-name` | Inside dialog |
| Email input | `#inv-email` | Inside dialog |
| Role select | Radix Select trigger in dialog | Developer/PM/Tester/Viewer |
| Send invite button | `button:has-text("Send Invite")` | Inside dialog |
| Cancel button | `button:has-text("Cancel")` inside dialog | |

### Methods

- `navigate(): Promise<void>` — goto `/team`, wait for `[data-testid="member-card"]` or `[data-testid="empty-state"]` (Pattern 10, 13)
- `clickInviteMember(): Promise<void>` — click Invite Member button
- `fillInviteDialog(name: string, email: string, role?: string): Promise<void>` — fill name, email, optionally select role
- `submitInviteDialog(): Promise<void>` — click Send Invite
- `cancelDialog(): Promise<void>` — click Cancel
- `getMemberCardCount(): Promise<number>` — count `[data-testid="member-card"]`
- `isEmptyStateVisible(): Promise<boolean>` — check empty-state visibility
