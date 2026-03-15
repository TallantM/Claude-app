# Workflows — team

1. **team page loads with member cards (seeded data)**
   - Use stored auth state
   - Navigate to `/team`
   - Wait for `[data-testid="member-card"]` or `[data-testid="empty-state"]`
   - Assert first `[data-testid="member-card"]` visible
   - Assert "Invite Member" button visible

2. **invite new team member via dialog**
   - Navigate to `/team`, wait for page to settle
   - Click `button:has-text("Invite Member")`
   - Assert dialog visible with "Invite Team Member" heading
   - Fill `#inv-name` with "E2E Member ${suffix}" (Pattern 5)
   - Fill `#inv-email` with `e2e-member-${suffix}@example.com`
   - Click "Send Invite"
   - Wait for dialog to close
   - Assert new member name visible in member cards grid

3. **stat cards display correct counts**
   - Navigate to `/team`, wait for member cards
   - Assert "Total Members" stat card shows a number > 0
   - Assert "Admins" stat card shows a number

4. **empty state renders when no members (conditional skip if DB seeded)**
   - Navigate to `/team`
   - Check: `const isEmpty = (await page.locator('[data-testid="empty-state"]').count()) > 0`
   - If not empty: `test.skip()` — conditional skip if DB is seeded
   - Assert `[data-testid="empty-state"]` visible

5. **cancel button dismisses the invite dialog**
   - Navigate to `/team`
   - Click "Invite Member"
   - Assert dialog visible
   - Click Cancel
   - Assert dialog no longer visible
