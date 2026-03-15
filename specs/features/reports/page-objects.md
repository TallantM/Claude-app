# Page Objects — reports

## ReportsPage

**URL**: `/reports`
**File**: `tests/e2e/page-objects/reports.page.ts`
**Class**: `ReportsPage`

### Notes on Selectors

This page has **no `data-testid` attributes** and makes **no API calls** (static mock data). Wait for `h1` as the load indicator (Pattern 12).

### Elements

| Element | Selector | Notes |
|---------|----------|-------|
| Page heading | `h1:has-text("Reports & Analytics")` | Load indicator (Pattern 12) |
| Page subtitle | `p:has-text("Track your team")` | Below heading |
| Burndown card | `text="Sprint Burndown"` | Card title |
| Velocity card | `text="Team Velocity"` | Card title |
| Issue dist card | `text="Issue Distribution"` | Card title |
| Completion card | `text="Task Completion Trend"` | Card title |
| Export buttons | `button:has-text("Export")` | 4 total, one per chart |
| Chart containers | `div.h-\\[300px\\]` | Canvas chart wrappers |

### Methods

- `navigate(): Promise<void>` — goto `/reports`, wait for `h1` with timeout 10000ms (Pattern 12)
- `getChartCardTitles(): Promise<string[]>` — return text of all `CardTitle` elements
- `clickExport(index: number): Promise<void>` — click nth "Export" button (0-indexed)
- `isChartCardVisible(title: string): Promise<boolean>` — check visibility of card with given title text
