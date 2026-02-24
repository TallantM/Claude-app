# Dashboard Page Object Specification

## Page Overview: DashboardPage

**Page Name**: DashboardPage
**URL**: `/dashboard`
**Purpose**: Overview of the SDLC workspace — stat cards, recent activity feed, task distribution.
**Class**: `DashboardPage`

### What It Does
Wraps the dashboard page so tests can navigate to it, read the stat values,
verify the activity feed, and check the task distribution chart — all without
knowing about selectors or component internals.

---

## Page Elements

| Element | Selector | Type | Purpose |
|---------|----------|------|---------|
| Page heading | `h1:has-text("Dashboard")` | Heading | Confirms this is the dashboard |
| Stat cards | `[data-testid]` or Cards with stat labels | Cards | Shows numeric stats |
| Total Projects card | Card containing "Total Projects" label | Card | Project count |
| Total Tasks card | Card containing "Total Tasks" label | Card | Task count |
| Completed Tasks card | Card containing "Completed Tasks" label | Card | Done task count |
| Open Issues card | Card containing "Open Issues" label | Card | Open issue count |
| Active Sprints card | Card containing "Active Sprints" label | Card | Sprint count |
| Team Members card | Card containing "Team Members" label | Card | Member count |
| Recent Activity heading | `text="Recent Activity"` | Card heading | Activity section |
| Task Distribution heading | `text="Task Distribution"` | Card heading | Chart section |
| Activity items | Activity entries in the feed | Div rows | Individual activity entries |
| Loading skeleton | Animated pulse divs | Divs | Visible while data loads |

### Selector Strategy
Use heading text to locate stat card labels. Use `h1` for page confirmation.
Use text content of card titles to find specific stat sections.

---

## Methods

### navigateTo
**Signature**: `Promise<void> navigateTo()`
**What it does**: Navigates to `/dashboard` and waits for the page to load.

---

### isLoaded
**Signature**: `Promise<boolean> isLoaded()`
**What it does**: Returns true when the "Dashboard" heading is visible and loading is done.
**Behavior**: Waits for heading to appear (loading skeleton disappears first).

---

### getStatValue
**Signature**: `Promise<string> getStatValue(label: string)`
**What it does**: Returns the numeric value shown in the stat card with the given label.
**Parameters**:
- `label` (string): The stat card label (e.g., "Total Projects", "Total Tasks")
**Returns**: The displayed number as a string.

---

### isActivityFeedVisible
**Signature**: `Promise<boolean> isActivityFeedVisible()`
**What it does**: Returns true if the "Recent Activity" section is visible.

---

### getActivityItemCount
**Signature**: `Promise<number> getActivityItemCount()`
**What it does**: Returns the number of activity entries in the feed.

---

### isTaskDistributionVisible
**Signature**: `Promise<boolean> isTaskDistributionVisible()`
**What it does**: Returns true if the "Task Distribution" section is visible.

---

### isLoadingSkeletonVisible
**Signature**: `Promise<boolean> isLoadingSkeletonVisible()`
**What it does**: Returns true if animated skeleton elements are visible (loading state).

---

## Implementation Rules

**Constructor**: `constructor(private readonly page: Page)`
**Methods**: All async, no assertions.
**File Location**: `tests/e2e/page-objects/dashboard.page.ts` → `DashboardPage`

### Notes on Selectors
The dashboard page does not have `data-test` attributes. Use text-based selectors:
- Stat card value: find the Card containing the label text, then get the sibling number div.
- This may require locating the card by its header text and reading the content section.
