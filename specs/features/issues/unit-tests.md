# Unit Tests — issues

1. **shows loading skeleton while fetch is pending**
   - Mock `fetch` with never-resolving promise
   - Render `IssuesPage`
   - Assert animate-pulse skeleton elements visible
   - Assert no `[data-testid="issue-card"]` rendered

2. **renders issue cards after data loads**
   - Mock `fetch` to return two issues: "Login button broken" (open/high/bug) and "Dark mode feature" (in_progress/medium/feature)
   - Assert both `[data-testid="issue-card"]` elements visible
   - Assert issue titles in the document

3. **client-side search filters visible issues**
   - Mock `fetch` with two issues loaded
   - Type "Login" into `input[placeholder="Search issues..."]`
   - Assert only "Login button broken" card visible; "Dark mode feature" not visible

4. **shows "No issues found" message when list is empty**
   - Mock `fetch` to return `{ data: [], pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 } }`
   - Assert "No issues found" text visible
   - Assert no `[data-testid="issue-card"]`

5. **opens create issue dialog when New Issue button clicked**
   - Mock `fetch` with issues data (and `/api/projects` mock for the dialog)
   - Click `[data-testid="create-issue-btn"]`
   - Assert dialog "Report New Issue" heading visible
   - Assert `#issue-title` input present

6. **create issue dialog has submit button inside a form (structural assertion)**
   - Open create dialog
   - Get submit button by role with name `/create issue/i`
   - Assert `type="submit"`
   - Assert `closest("form")` not null
   - Assert `document.getElementById("issue-title")` has `name="title"` — Pattern 7

7. **clicking issue card opens detail dialog**
   - Mock `fetch` with one issue, click `[data-testid="issue-card"]`
   - Assert dialog showing issue title is visible

8. **status filter select renders with all status options**
   - Assert Radix Select trigger exists for status (first combobox)
   - Assert "All Status", "Open", "In Progress", "Resolved", "Closed" option texts accessible

9. **severity filter select renders with all severity options**
   - Assert "All Severity", "Low", "Medium", "High", "Critical" option texts accessible

10. **shows error state when fetch rejects**
    - Mock `fetch` to throw
    - Assert "Error loading issues" is visible
