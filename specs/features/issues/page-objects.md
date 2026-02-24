# Issues Page Object Specification

## Page Overview: IssuesPage

**Page Name**: IssuesPage
**URL**: `/issues`
**Purpose**: Issue tracker with status/severity filters, search, create dialog, and detail dialog.
**Class**: `IssuesPage`

### What It Does
Wraps the issues list page — lets tests search, filter by status and severity, open the
"Report New Issue" dialog, read issue rows, and click issues to view details.

---

## Page Elements

| Element | Selector | Type | Purpose |
|---------|----------|------|---------|
| Page heading | `h1:has-text("Issues")` | Heading | Confirms this is the issues page |
| Search input | `input[placeholder="Search issues..."]` | Input | Client-side text filter |
| Status filter | first Select trigger | Combobox | Filter by open/in_progress/resolved/closed |
| Severity filter | second Select trigger | Combobox | Filter by low/medium/high/critical |
| New Issue button | `button:has-text("New Issue")` | Button | Opens create issue dialog |
| Issue cards | clickable Card elements in list | Cards | Each row is one issue |
| Empty state | `h3:has-text("No issues found")` | Heading | Shown when no results |
| Create dialog heading | `"Report New Issue"` in dialog | Dialog title | Create issue dialog |
| Issue title input | `#issue-title` | Input | Title field in create form |
| Issue description | `#issue-desc` | Textarea | Description field |
| Issue type select | Type combobox in dialog | Select | bug/feature/improvement/task |
| Issue severity select | Severity combobox in dialog | Select | low/medium/high/critical |
| Issue status select | Status combobox in dialog | Select | open/in_progress/resolved/closed |
| Repro steps textarea | `#issue-repro` | Textarea | Reproduction steps |
| Create submit button | `button:has-text("Create Issue")` | Button | Submit create form |
| Cancel button | `button:has-text("Cancel")` in dialog | Button | Dismiss dialog |
| Detail dialog | `[role="dialog"]` when issue clicked | Dialog | Issue detail view |

### Selector Strategy
Headings for page confirmation; `#id` for dialog inputs; `[placeholder]` for search;
`[role="combobox"]` nth for status/severity selects (in order of appearance).

---

## Methods

### navigateTo
**Signature**: `Promise<void> navigateTo()`
**What it does**: Navigates to `/issues` and waits for the page to load.

---

### searchIssues
**Signature**: `Promise<void> searchIssues(term: string)`
**What it does**: Types the given term into the search input. Filters client-side.
**Parameters**:
- `term` (string): Search text to type

---

### filterByStatus
**Signature**: `Promise<void> filterByStatus(status: "all" | "open" | "in_progress" | "resolved" | "closed")`
**What it does**: Selects the given status from the first Select trigger (status filter).

---

### filterBySeverity
**Signature**: `Promise<void> filterBySeverity(severity: "all" | "low" | "medium" | "high" | "critical")`
**What it does**: Selects the given severity from the second Select trigger (severity filter).

---

### clickNewIssue
**Signature**: `Promise<void> clickNewIssue()`
**What it does**: Clicks the "New Issue" button to open the create dialog.

---

### createIssue
**Signature**: `Promise<void> createIssue(title: string, description?: string)`
**What it does**: Fills the create issue dialog with the given title (and description if provided),
keeping default values for type/severity/status, then clicks "Create Issue".
**Parameters**:
- `title` (string): Issue title
- `description` (string, optional): Issue description

---

### getIssueCount
**Signature**: `Promise<number> getIssueCount()`
**What it does**: Returns the number of issue rows currently visible.

---

### getIssueTitles
**Signature**: `Promise<string[]> getIssueTitles()`
**What it does**: Returns all visible issue titles as an array.

---

### clickIssue
**Signature**: `Promise<void> clickIssue(title: string)`
**What it does**: Clicks the issue row matching the given title to open the detail dialog.

---

### isDetailDialogOpen
**Signature**: `Promise<boolean> isDetailDialogOpen()`
**What it does**: Returns true if the issue detail dialog is currently visible.

---

### isEmptyStateVisible
**Signature**: `Promise<boolean> isEmptyStateVisible()`
**What it does**: Returns true if the "No issues found" empty state is visible.

---

## Implementation Rules

**Constructor**: `constructor(private readonly page: Page)`
**Methods**: All async, no assertions.
**File Location**: `tests/e2e/page-objects/issues.page.ts` → `IssuesPage`
