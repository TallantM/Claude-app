# Unit Tests — team

1. **shows loading skeletons while fetch is pending**
   - Mock `fetch` with never-resolving promise
   - Render `TeamPage`
   - Assert Skeleton elements visible (4 skeleton cards)
   - Assert no `[data-testid="member-card"]` rendered

2. **renders member cards after data loads**
   - Mock `fetch` to return `{ data: [{ id: "1", name: "Alice Smith", email: "alice@example.com", role: "developer", image: null }], pagination: { total: 1, page: 1, pageSize: 10, totalPages: 1 } }`
   - Assert `[data-testid="member-card"]` visible
   - Assert "Alice Smith" text in document

3. **shows empty state card when no members exist**
   - Mock `fetch` to return `{ data: [], pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 } }`
   - Assert `[data-testid="empty-state"]` visible
   - Assert "No team members yet" text

4. **renders role badge for each member**
   - Mock `fetch` with members of roles: developer, admin, tester
   - Assert each member card shows their role label badge (e.g., "Developer", "Admin", "Tester")

5. **stat cards show total members, admins, developer counts**
   - Mock `fetch` with 3 members: 1 admin, 2 developers
   - Assert "3" for Total Members stat
   - Assert "1" for Admins stat
   - Assert "2" for Developers stat

6. **opens invite dialog when Invite Member button clicked**
   - Mock `fetch` with members data
   - Click `button:has-text("Invite Member")`
   - Assert dialog with "Invite Team Member" heading visible
   - Assert `#inv-name`, `#inv-email` inputs present

7. **invite dialog: Send Invite button is present and calls /api/auth/register**
   - Open invite dialog
   - Fill `#inv-name` with "New Member", `#inv-email` with "new@example.com"
   - Mock `fetch` for POST to `/api/auth/register` to return `{ ok: true }`
   - Click "Send Invite" button
   - Assert `fetch` called with POST to `/api/auth/register`

8. **invite dialog closes on Cancel**
   - Open dialog, click Cancel
   - Assert "Invite Team Member" heading no longer visible

9. **role select in invite dialog has correct options**
   - Open invite dialog
   - Assert "Developer", "Project Manager", "Tester", "Viewer" options accessible in role select

10. **avatar initials are rendered from member name**
    - Mock `fetch` with member `name: "Bob Jones"`
    - Assert "BJ" text (initials) appears in the member card avatar
