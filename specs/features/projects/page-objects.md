# Projects Page Object Specification

## Page Overview: ProjectsPage

**Page Name**: ProjectsPage
**URL**: `/projects`
**Purpose**: Paginated project list with search/filter and a "Create New Project" dialog.
**Class**: `ProjectsPage`

### What It Does
Wraps the projects list page — lets tests search for projects, filter by status,
open the create-project dialog, fill the form, and read project cards from the grid.

---

## Page Elements

| Element | Selector | Type | Purpose |
|---------|----------|------|---------|
| Page heading | `h1:has-text("Projects")` | Heading | Confirms this is the projects page |
| Search input | `input[placeholder="Search projects..."]` | Input | Filter projects by name/key |
| Status filter | `[role="combobox"]` first instance | Select | Filter by active/archived/completed |
| New Project button | `button:has-text("New Project")` | Button | Opens create project dialog |
| Project cards | `.cursor-pointer` cards in grid | Cards | Each represents a project |
| Empty state | `h3:has-text("No projects found")` | Heading | Shown when no results |
| Create Project dialog | `[role="dialog"]` | Dialog | New project form |
| Dialog name input | `#name` (in dialog) | Input | Project name |
| Dialog key input | `#key` (in dialog) | Input | Project key (auto-generated) |
| Dialog description | `textarea` (in dialog) | Textarea | Optional description |
| Dialog status select | second `[role="combobox"]` in dialog | Select | Project status |
| Dialog submit button | `button:has-text("Create Project")` | Button | Submit new project form |
| Dialog cancel button | `button:has-text("Cancel")` | Button | Dismiss dialog |
| Pagination controls | pagination component | Nav | Navigate pages |

### Selector Strategy
Use heading text for page confirmation. Use `#id` for dialog inputs (they're in a dialog).
Use `input[placeholder="..."]` for the search bar.

---

## Methods

### navigateTo
**Signature**: `Promise<void> navigateTo()`
**What it does**: Navigates to `/projects` and waits for the page to load.

---

### searchProjects
**Signature**: `Promise<void> searchProjects(term: string)`
**What it does**: Types the given term into the search input. The list filters automatically.
**Parameters**:
- `term` (string): Search text to enter

---

### filterByStatus
**Signature**: `Promise<void> filterByStatus(status: "all" | "active" | "archived" | "completed")`
**What it does**: Selects the given status from the status filter dropdown.
**Parameters**:
- `status`: The status option to select

---

### clickNewProject
**Signature**: `Promise<void> clickNewProject()`
**What it does**: Clicks the "New Project" button, opening the create dialog.

---

### createProject
**Signature**: `Promise<void> createProject(name: string, description?: string)`
**What it does**: Fills the create project dialog and submits.
**Parameters**:
- `name` (string): Project name (key is auto-generated from name)
- `description` (string, optional): Project description
**Behavior**: Opens dialog if not already open, fills name (and description if provided), submits.

---

### getProjectCardTitles
**Signature**: `Promise<string[]> getProjectCardTitles()`
**What it does**: Returns the name of every project card currently visible.
**Returns**: Array of project name strings.

---

### getProjectCardCount
**Signature**: `Promise<number> getProjectCardCount()`
**What it does**: Returns the number of project cards in the grid.

---

### clickProjectCard
**Signature**: `Promise<void> clickProjectCard(name: string)`
**What it does**: Clicks the project card with the given name.
**Parameters**:
- `name` (string): The project name to click

---

### isEmptyStateVisible
**Signature**: `Promise<boolean> isEmptyStateVisible()`
**What it does**: Returns true if the "No projects found" empty state is visible.

---

### isDialogOpen
**Signature**: `Promise<boolean> isDialogOpen()`
**What it does**: Returns true if the create project dialog is currently open.

---

## Implementation Rules

**Constructor**: `constructor(private readonly page: Page)`

**Methods**: All async, no assertions.

**File Location**: `tests/e2e/page-objects/projects.page.ts` → `ProjectsPage`
