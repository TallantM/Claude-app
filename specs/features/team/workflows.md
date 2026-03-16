# Team — E2E Workflow Specification

## Test File
`tests/e2e/team.spec.ts`

## Auth
All tests use `storageState: ".auth/user.json"` (authenticated user).

## Workflows

1. **loads the team page with heading and Invite Member button**
   - Navigate to `/team`
   - Assert: `h1` with "Team Management" is visible
   - Assert: "Invite Member" button is visible
   - Assert: URL is `/team`

2. **shows member cards or empty state (seed-aware)**
   - Navigate to `/team`
   - If empty state: assert `[data-testid="empty-state"]` is visible
   - If cards: assert at least one `[data-testid="member-card"]` is visible

3. **opens invite dialog on Invite Member click**
   - Navigate to `/team`
   - Click "Invite Member"
   - Assert: dialog with "Invite Team Member" title is visible
   - Assert: Full Name and Email fields are present

4. **closes invite dialog on Cancel**
   - Navigate to `/team`
   - Click "Invite Member"
   - Wait for dialog visible
   - Click "Cancel"
   - Assert: dialog is no longer visible

5. **invites a new team member successfully**
   - Navigate to `/team`
   - Click "Invite Member"
   - Fill name and unique email
   - Click "Send Invite"
   - Assert: dialog closes; member count increases by 1 OR new member card is visible

6. **stat cards show numeric values**
   - Navigate to `/team`
   - Wait for data to load
   - Assert: "Total Members", "Admins", "Developers" stat labels are visible
