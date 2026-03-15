# Page Objects — issues

## IssuesPage

**URL**: `/issues`
**File**: `tests/e2e/page-objects/issues.page.ts`
**Class**: `IssuesPage`

### Elements

| Element | Selector | Notes |
|---------|----------|-------|
| Page heading | `h1:has-text("Issues")` | Confirm page |
| Create issue button | `[data-testid="create-issue-btn"]` | Opens dialog |
| Issue cards | `[data-testid="issue-card"]` | Repeated per issue |
| Search input | `input[placeholder="Search issues..."]` | Client-side filter |
| Status filter | First `[role="combobox"]` | Radix Select |
| Severity filter | Second `[role="combobox"]` | Radix Select |
| Create dialog | `[role="dialog"]` with "Report New Issue" title | Modal |
| Issue title input | `#issue-title` | Inside dialog |
| Issue description | `#issue-desc` | Textarea in dialog |
| Issue repro | `#issue-repro` | Textarea in dialog |
| Submit button | `button[type="submit"]:has-text("Create Issue")` | |
| Cancel button | `button:has-text("Cancel")` inside dialog | |

### Methods

- `navigate(): Promise<void>` — goto `/issues`, wait for `[data-testid="issue-card"]` or text "No issues found" (Pattern 10, 13)
- `clickCreateIssueBtn(): Promise<void>` — click `[data-testid="create-issue-btn"]`
- `fillCreateDialog(title: string, description?: string): Promise<void>` — fill `#issue-title` and optionally `#issue-desc`
- `submitCreateDialog(): Promise<void>` — click "Create Issue" submit
- `cancelDialog(): Promise<void>` — click Cancel
- `searchIssues(term: string): Promise<void>` — type into search input
- `filterByStatus(status: string): Promise<void>` — interact with first Radix Select
- `filterBySeverity(severity: string): Promise<void>` — interact with second Radix Select
- `getIssueCardCount(): Promise<number>` — count `[data-testid="issue-card"]`
- `clickFirstIssueCard(): Promise<void>` — click first card
- `isDetailDialogVisible(): Promise<boolean>` — check `[role="dialog"]` visibility
