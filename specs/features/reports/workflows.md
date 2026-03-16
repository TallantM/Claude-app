# Reports — E2E Workflow Specification

## Test File
`tests/e2e/reports.spec.ts`

## Auth
All tests use `storageState: ".auth/user.json"` (authenticated user).

## Notes
Chart.js uses canvas elements — do NOT assert chart internals.
Only assert page structure, headings, and button presence.

## Workflows

1. **loads the reports page with heading**
   - Navigate to `/reports`
   - Assert: `h1` with "Reports & Analytics" is visible
   - Assert: URL is `/reports`

2. **shows all four chart card titles**
   - Navigate to `/reports`
   - Assert: "Sprint Burndown" card title visible
   - Assert: "Team Velocity" card title visible
   - Assert: "Issue Distribution" card title visible
   - Assert: "Task Completion Trend" card title visible

3. **shows four Export buttons**
   - Navigate to `/reports`
   - Assert: exactly 4 "Export" buttons are visible

4. **Export button is clickable without crashing**
   - Navigate to `/reports`
   - Click first "Export" button
   - Assert: page does not navigate away; no uncaught errors
