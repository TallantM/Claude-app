# Unit Tests — projects

1. **shows loading skeleton while fetch is pending**
   - Mock `fetch` with never-resolving promise
   - Render `ProjectsPage`
   - Assert animate-pulse skeleton elements are visible
   - Assert no `[data-testid="project-card"]` is rendered

2. **renders project cards after data loads**
   - Mock `fetch` to return `{ data: [{ id: "1", name: "Alpha Project", key: "AP", status: "active", taskCount: 5, openIssues: 2 }], pagination: { total: 1, page: 1, pageSize: 10, totalPages: 1 } }`
   - Assert `[data-testid="project-card"]` is visible
   - Assert text "Alpha Project" is in the document

3. **shows empty state when no projects returned**
   - Mock `fetch` to return `{ data: [], pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 } }`
   - Assert `[data-testid="empty-state"]` is visible
   - Assert "No projects found" text is shown

4. **opens create project dialog when New Project button is clicked**
   - Mock `fetch` with one project
   - Click `[data-testid="new-project-btn"]`
   - Assert dialog with "Create New Project" heading is visible
   - Assert `#name` input is in the document

5. **create project dialog has submit button inside a form (structural assertion)**
   - Mock `fetch` with one project, open dialog
   - Get the submit button by role `button` with name `/create project/i`
   - Assert `submitBtn.getAttribute("type") === "submit"`
   - Assert `submitBtn.closest("form")` is not null
   - Assert `document.getElementById("name")` has attribute `name="name"` — Pattern 7

6. **closes dialog on Cancel click**
   - Open dialog, click Cancel button
   - Assert dialog is not visible
   - Assert "Create New Project" heading is absent

7. **search input is present and bound**
   - Mock `fetch` with projects
   - Assert `input[placeholder="Search projects..."]` is in the document
   - Type into the input — assert value changes

8. **status filter select is rendered with correct options**
   - Assert Radix Select trigger with "All Statuses" option text is present

9. **shows error state when fetch rejects**
   - Mock `fetch` to throw `new Error("Server error")`
   - Assert "Error loading projects" is visible

10. **clicking project card navigates to /projects/{id}**
    - Mock `useRouter` with `push: vi.fn()`
    - Mock `fetch` with one project (id: "1")
    - Click `[data-testid="project-card"]`
    - Assert `router.push("/projects/1")` called
