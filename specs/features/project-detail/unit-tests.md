# Unit Tests — project-detail

1. **shows loading skeleton while fetch is pending**
   - Mock `useParams` to return `{ id: "proj-1" }`
   - Mock `fetch` with never-resolving promise
   - Render `ProjectDetailPage`
   - Assert animate-pulse skeleton elements visible
   - Assert no `[data-testid="task-card"]` rendered

2. **renders project name, key, and status badge after data loads**
   - Mock `fetch` to return `{ project: { id: "proj-1", name: "Alpha", key: "AP", status: "active", taskCount: 5, openIssues: 2 }, tasks: [], sprints: [] }`
   - Assert text "Alpha" is visible
   - Assert badge "AP" is visible
   - Assert badge "active" is visible

3. **renders four kanban columns with correct testids**
   - Mock `fetch` with empty tasks
   - Assert `[data-testid="kanban-col-todo"]`, `kanban-col-in-progress`, `kanban-col-in_review`, `kanban-col-done` are all present

4. **task cards appear in the correct kanban column**
   - Mock `fetch` with tasks: `[{ id: "t1", title: "Task A", status: "todo", priority: "medium" }, { id: "t2", title: "Task B", status: "done", priority: "low" }]`
   - Assert "Task A" is inside `[data-testid="kanban-col-todo"]`
   - Assert "Task B" is inside `[data-testid="kanban-col-done"]`

5. **create task dialog has submit button inside a form (structural assertion)**
   - Mock `fetch` with project data, click "Add task" button in todo column
   - Get submit button by role `button` with name `/create task/i`
   - Assert `type="submit"` attribute
   - Assert `closest("form")` is not null
   - Assert `document.getElementById("task-title")` has attribute `name="title"` — Pattern 7

6. **clicking Back button navigates to /projects**
   - Mock `useRouter` with `push: vi.fn()`
   - Mock `fetch` with valid project
   - Click `[data-testid="back-to-projects"]`
   - Assert `router.push("/projects")` called

7. **Backlog tab renders backlog tasks without sprint assignment**
   - Mock `fetch` with tasks where one has `sprintId: null` and one has `sprintId: "s1"`
   - Click "Backlog" tab trigger
   - Assert only the sprint-less task title is visible in backlog view

8. **Sprints tab renders sprint cards when sprints exist**
   - Mock `fetch` with `sprints: [{ id: "s1", name: "Sprint 1", status: "active", goal: "Ship it", tasks: [], startDate: null, endDate: null }]`
   - Click "Sprints" tab trigger
   - Assert "Sprint 1" text is visible

9. **shows error state when fetch fails**
   - Mock `fetch` to throw `new Error("Not found")`
   - Assert "Error loading project" text visible

10. **task click opens task detail dialog**
    - Mock `fetch` with one task in todo column
    - Click `[data-testid="task-card"]`
    - Assert dialog with task title is visible
