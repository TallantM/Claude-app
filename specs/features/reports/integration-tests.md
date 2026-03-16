# Reports — Integration Test Specification

## Notes
The reports page uses static mock data — no API calls. All charts render from
hard-coded datasets. Future integration with real API endpoints is planned.

## Current State
- No API routes for reports data
- Data is hard-coded in the component

## Future API Scenarios (when wired up)
1. GET /api/reports/burndown?sprintId=X — returns burndown data points
2. GET /api/reports/velocity — returns sprint velocity history
3. GET /api/reports/issues — returns issue distribution by severity
4. GET /api/reports/completion — returns monthly task completion trends
