# Team — Unit Test Specification

## Test File
`tests/unit/team-page.test.tsx`

## Mocks Required
- `next/navigation` → `useRouter`, `useSearchParams`, `usePathname`
- `global.fetch` → mock paginated API response

## Mock Data Shape
```typescript
{
  data: [{
    id: "u1",
    name: "Alice Smith",
    email: "alice@example.com",
    role: "admin",
    image: null
  }, {
    id: "u2",
    name: "Bob Jones",
    email: "bob@example.com",
    role: "developer",
    image: null
  }],
  pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 }
}
```

## Test Scenarios

1. **renders the heading and Invite Member button**
   - Given: fetch resolves with team members
   - Then: "Team Management" heading visible; "Invite Member" button visible

2. **renders member cards after data loads**
   - Given: fetch resolves with two members
   - Then: "Alice Smith" and "Bob Jones" are visible

3. **shows empty state when team has no members**
   - Given: fetch resolves with empty data array
   - Then: `[data-testid="empty-state"]` is visible with "No team members yet"

4. **shows loading skeleton while data is loading**
   - Given: fetch never resolves
   - Then: skeleton elements are in the DOM; member cards are not

5. **opens invite dialog when Invite Member is clicked**
   - Given: page loaded with members
   - When: "Invite Member" button is clicked
   - Then: dialog with "Invite Team Member" title is visible; Full Name and Email inputs present

6. **closes invite dialog when Cancel is clicked**
   - Given: invite dialog is open
   - When: "Cancel" button is clicked
   - Then: dialog is no longer visible

7. **Send Invite button is a submit-type button in the dialog**
   - Given: invite dialog is open
   - Then: "Send Invite" button exists within the dialog

8. **shows stat cards for Total Members, Admins, Developers**
   - Given: fetch resolves with two members (1 admin, 1 developer)
   - Then: "Total Members", "Admins", "Developers" labels are visible

9. **renders role badge on member card**
   - Given: a member with role "admin"
   - Then: "Admin" badge is visible on their card
