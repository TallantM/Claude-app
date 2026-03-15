# SDD Project Patterns — sdlc-hub

This is the Tier 3 (project-specific) patterns file for the sdlc-hub app.
Read alongside `sdd-framework/stacks/nextjs-vitest-playwright.md` when generating tests.

---

## App Overview

| Property | Value |
|----------|-------|
| App name | sdlc-hub |
| Framework | Next.js 14, TypeScript, Tailwind, shadcn/ui |
| Database | Prisma + SQLite (`prisma/dev.db`) |
| Auth | NextAuth v4 credentials provider |
| Test stack | Vitest + React Testing Library (unit), Playwright (E2E) |

---

## Test Credentials

| Account | Email | Password |
|---------|-------|----------|
| Tester | `tester@sdlchub.com` | `test1234` |
| Admin | `admin@sdlchub.com` | `admin123` |

Auth state saved to: `tests/e2e/.auth/user.json`
Seed command: `npm run db:seed`

---

## Route Structure

- Login page: `/login` (NOT the default NextAuth `/api/auth/signin`)
- App routes use `src/app/(app)/` layout group — `(app)` is NOT part of the URL
- Dynamic route `projects/[id]` → spec name `project-detail`
- `APP_FEATURE_NAME_MAP` for conformance: `{ 'projects/[id]': 'project-detail' }`

---

## data-testid Attribute Map

| Feature | Selector | Notes |
|---------|----------|-------|
| Dashboard | `[data-testid="stat-card-totalProjects"]` | Also: totalTasks, completedTasks, openIssues, activeSprints, teamMembers |
| Dashboard | `[data-testid="activity-feed"]` | Recent activity list |
| Dashboard | `[data-testid="task-dist-todo"]` | Also: in_progress, in_review, done |
| Projects | `[data-testid="project-card"]` | Repeated per project |
| Projects | `[data-testid="new-project-btn"]` | Opens create project dialog |
| Projects | `[data-testid="empty-state"]` | Shown when no projects |
| Project Detail | `[data-testid="kanban-col-todo"]` | Also: in_progress, in_review, done |
| Project Detail | `[data-testid="task-card"]` | Repeated per task |
| Issues | `[data-testid="issue-card"]` | Repeated per issue |
| Issues | `[data-testid="create-issue-btn"]` | Opens create issue dialog |
| Pipelines | `[data-testid="pipeline-card"]` | Repeated per pipeline |
| Pipelines | `[data-testid="empty-state"]` | Shown when no pipelines |
| Repos | `[data-testid="repo-card"]` | Repeated per repo |
| Repos | `[data-testid="connect-repo-btn"]` | Opens connect repo dialog |
| Repos | `[data-testid="empty-state"]` | Shown when no repos |
| Team | `[data-testid="member-card"]` | Repeated per member |
| Team | `[data-testid="empty-state"]` | Shown when no members |
| Settings | `[data-testid="profile-name-input"]` | Profile name field |

**Important**: Notifications and Reports pages do NOT have data-testid attributes.
For these pages, wait for `h1` heading instead:
```typescript
await page.waitForSelector('h1', { timeout: 10000 });
```

---

## Seeded Database Behavior

The seed (`npm run db:seed`) creates sample data including projects, tasks, issues, pipelines, and team members. Tests run against this seeded data.

**Implications:**
- Empty-state tests will be skipped (data exists) — use conditional skip pattern
- Count assertions must use `toBeGreaterThan(0)` not exact counts
- For tests requiring a specific created item, create it in the test with a unique name

---

## Sign-Out Flow

Sign-out is inside a Radix `DropdownMenu` in the header. The button is NOT directly accessible.

```typescript
// Open the user dropdown first
await page.click('header button:has([data-slot="avatar"])');
await page.waitForSelector('[role="menu"]');
await page.click('[role="menuitem"]:has-text("Sign out")');
await expect(page).toHaveURL(/login/, { timeout: 10000 });
```

---

## Radix UI Components in Use

- `Dialog` — used for: Create Project, Create Task, Create Issue, Connect Repo, Invite Team Member
- `DropdownMenu` — used for: User menu (sign-out), Task status change
- `Select` — used for: Issue severity/status filters, Project status filter

All Radix Dialog form tests in unit tests must use **structural assertions** (see stack patterns file Pattern 7).
