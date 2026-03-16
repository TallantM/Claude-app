# Sprints — Page Object Specification

## Context
No dedicated `/sprints` page. Sprints are accessed via the Sprints tab on
the project detail page: `/projects/[id]`.

## Page Object Class
`SprintsPage` in `tests/e2e/page-objects/sprints.page.ts`

## Selectors

| Element | Selector |
|---|---|
| Back to Projects | `[data-testid="back-to-projects"]` |
| Sprints tab trigger | `button[role="tab"]:has-text("Sprints")` |
| Sprints tab panel | `[role="tabpanel"][data-state="active"]` |
| Sprint card | `[role="tabpanel"][data-state="active"] .space-y-4 > div` |
| Empty sprints message | `text=No sprints yet` |
| Sprint name | card title inside tabpanel |
| Sprint status badge | badge inside sprint card |

## Actions

### `navigate()`
- Navigates to `/projects`, waits for at least one project card
- Clicks the first project card
- Waits for project detail page to load (h1 visible)
- Clicks "Sprints" tab trigger
- Waits for `[role="tabpanel"][data-state="active"]`

### `getSprintCount()`
- Counts sprint cards in active tab panel

### `isEmptyStateVisible()`
- Returns visibility of "No sprints yet" text
