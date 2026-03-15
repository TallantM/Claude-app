# Unit Tests — reports

1. **renders Reports page heading**
   - Render `ReportsPage`
   - Assert `h1` with text "Reports & Analytics" is visible

2. **renders Sprint Burndown chart card**
   - Render `ReportsPage`
   - Assert "Sprint Burndown" card title text visible
   - Assert "Track remaining work in the current sprint" description text visible

3. **renders Team Velocity chart card**
   - Render `ReportsPage`
   - Assert "Team Velocity" card title text visible
   - Assert "Story points completed per sprint" description visible

4. **renders Issue Distribution chart card**
   - Render `ReportsPage`
   - Assert "Issue Distribution" card title text visible
   - Assert "Issues categorized by severity" description visible

5. **renders Task Completion Trend chart card**
   - Render `ReportsPage`
   - Assert "Task Completion Trend" card title text visible
   - Assert "Monthly task creation vs completion" description visible

6. **all four Export buttons are rendered**
   - Render `ReportsPage`
   - Assert four buttons with text "Export" are in the document (one per chart card)

7. **clicking Export button triggers the alert (placeholder)**
   - Mock `window.alert` with `vi.spyOn(window, "alert").mockImplementation(() => {})`
   - Click first "Export" button
   - Assert `window.alert` called with string containing "Exporting"

8. **page renders without any API calls (static mock data)**
   - Mock `fetch` with `vi.fn()` (not called)
   - Render `ReportsPage`
   - Assert "Reports & Analytics" heading visible
   - Assert `fetch` was NOT called (page uses static mock data)

9. **chart container divs have height class for canvas rendering**
   - Render `ReportsPage`
   - Assert `div.h-\[300px\]` elements are present (chart containers with fixed height)

10. **page subtitle is visible**
    - Render `ReportsPage`
    - Assert "Track your team's performance and project health" text visible
