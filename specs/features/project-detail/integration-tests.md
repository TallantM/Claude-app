# Integration Tests — project-detail

1. **GET /api/projects/{id} returns project with tasks and sprints arrays**
   - Get a seeded project id
   - GET `/api/projects/{id}`
   - Assert response status 200
   - Assert response contains project name, `tasks` array, `sprints` array

2. **POST /api/projects/{id}/tasks creates a task and returns it**
   - POST `/api/projects/{id}/tasks` with `{ title: "Integration Task", status: "todo", priority: "medium", type: "task" }`
   - Assert response status 200 or 201
   - Assert response body contains `id` and `title: "Integration Task"`

3. **PATCH /api/projects/{id}/tasks/{taskId} updates task status**
   - Create a task, then PATCH its status to `"done"`
   - Assert response status 200
   - Assert response body has `status: "done"`

4. **GET /api/projects/{id} returns 404 for non-existent project**
   - GET `/api/projects/nonexistent-id-12345`
   - Assert response status 404

5. **task distribution in project data reflects created tasks**
   - Create two tasks with different statuses
   - GET `/api/projects/{id}`
   - Assert returned `tasks` array includes both newly created tasks
