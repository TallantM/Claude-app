# Reports — Page Object Specification

## Route
`/reports`

## Page Object Class
`ReportsPage` in `tests/e2e/page-objects/reports.page.ts`

## Selectors

| Element | Selector |
|---|---|
| Page heading | `h1:has-text("Reports & Analytics")` |
| Sprint Burndown card title | `text=Sprint Burndown` |
| Team Velocity card title | `text=Team Velocity` |
| Issue Distribution card title | `text=Issue Distribution` |
| Task Completion Trend card title | `text=Task Completion Trend` |
| Export buttons | `button:has-text("Export")` |

## Actions

### `navigate()`
- `goto("/reports")`
- `waitForSelector('h1', { timeout: 10000 })`

### `clickExport(chartName: string)`
- Clicks the Export button within the card that has the given chart title

### `getExportButtonCount()`
- Returns count of Export buttons on the page
