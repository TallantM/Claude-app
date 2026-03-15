# Workflows — issues

1. **issues list loads with visible issue cards (seeded data)**
   - Use stored auth state
   - Navigate to `/issues`
   - Wait for `[data-testid="issue-card"]` or text "No issues found"
   - Assert first `[data-testid="issue-card"]` is visible (seed provides data)
   - Assert `[data-testid="create-issue-btn"]` is visible

2. **create new issue via dialog and verify it appears in list**
   - Navigate to `/issues`, wait for page to settle (Pattern 13)
   - Click `[data-testid="create-issue-btn"]`
   - Assert "Report New Issue" dialog visible
   - Fill `#issue-title` with unique name `E2E Issue ${suffix}` (Pattern 5)
   - Click "Create Issue"
   - Wait for dialog to close
   - Assert new issue title visible in list

3. **search filters issues by title (client-side)**
   - Navigate to `/issues`, wait for issue cards
   - Note first visible issue title text
   - Type first word into `input[placeholder="Search issues..."]`
   - Assert matching issue card visible
   - Clear search — assert full list returns

4. **clicking issue card opens detail dialog**
   - Navigate to `/issues`, wait for cards
   - Click first `[data-testid="issue-card"]`
   - Assert `[role="dialog"]` visible with issue title text

5. **status filter narrows issue list**
   - Navigate to `/issues`, wait for cards
   - Select "Open" from status filter (first Radix Select)
   - Wait for list to settle (Pattern 13)
   - Assert no "resolved" or "closed" badges visible in results
