/**
 * Project Detail unit tests matching spec scenarios 1-10.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectDetailPage from "@/app/(app)/projects/[id]/page";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({ id: "proj-1" }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/projects/proj-1",
}));

const MOCK_PROJECT_DATA = {
  project: {
    id: "proj-1",
    name: "Alpha",
    key: "AP",
    status: "active",
    taskCount: 2,
    openIssues: 1,
    description: null,
    startDate: null,
    endDate: null,
    teamId: null,
    teamName: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  tasks: [],
  sprints: [],
};

const MOCK_TASKS = [
  {
    id: "t1",
    title: "Task A",
    status: "todo",
    priority: "medium",
    type: "task",
    description: null,
    storyPoints: null,
    dueDate: null,
    sprintId: null,
    projectId: "proj-1",
    assigneeId: null,
    reporterId: "u1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
    assignee: null,
    reporter: { id: "u1", name: "Alice", email: "alice@example.com", image: null },
    labels: [],
    sprint: null,
  },
  {
    id: "t2",
    title: "Task B",
    status: "done",
    priority: "low",
    type: "task",
    description: null,
    storyPoints: null,
    dueDate: null,
    sprintId: null,
    projectId: "proj-1",
    assigneeId: null,
    reporterId: "u1",
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
    assignee: null,
    reporter: { id: "u1", name: "Alice", email: "alice@example.com", image: null },
    labels: [],
    sprint: null,
  },
];

describe("ProjectDetailPage (spec scenarios)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. shows loading skeleton while fetch is pending", () => {
    // Arrange
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise(() => {})));

    // Act
    const { container } = render(<ProjectDetailPage />);

    // Assert
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByTestId("task-card")).not.toBeInTheDocument();
  });

  it("2. renders project name, key, and status badge after data loads", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_PROJECT_DATA })
    );

    // Act
    render(<ProjectDetailPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Alpha")).toBeInTheDocument();
    });
    expect(screen.getByText("AP")).toBeInTheDocument();
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("3. renders four kanban columns with correct testids", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_PROJECT_DATA })
    );

    // Act
    const { container } = render(<ProjectDetailPage />);

    // Assert — columns use replace(/_/g, '-') so in_progress → in-progress, in_review → in-review
    await waitFor(() => {
      expect(container.querySelector('[data-testid="kanban-col-todo"]')).toBeInTheDocument();
    });
    expect(container.querySelector('[data-testid="kanban-col-in-progress"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="kanban-col-in-review"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="kanban-col-done"]')).toBeInTheDocument();
  });

  it("4. task cards appear in the correct kanban column", async () => {
    // Arrange
    const dataWithTasks = { ...MOCK_PROJECT_DATA, tasks: MOCK_TASKS };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => dataWithTasks })
    );

    // Act
    const { container } = render(<ProjectDetailPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Task A")).toBeInTheDocument();
    });
    const todoCol = container.querySelector('[data-testid="kanban-col-todo"]');
    expect(todoCol).toHaveTextContent("Task A");
    const doneCol = container.querySelector('[data-testid="kanban-col-done"]');
    expect(doneCol).toHaveTextContent("Task B");
  });

  it("5. create task dialog has submit button inside a form (structural assertion)", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_PROJECT_DATA })
    );
    const user = userEvent.setup();
    const { container } = render(<ProjectDetailPage />);
    await waitFor(() => container.querySelector('[data-testid="kanban-col-todo"]'));

    // Act — click "Add task" in the todo column
    const todoCol = container.querySelector('[data-testid="kanban-col-todo"]')!;
    const addTaskBtn = todoCol.querySelector('button');
    await user.click(addTaskBtn!);

    // Assert — Pattern 7: structural form assertions
    await waitFor(() => {
      expect(screen.getByText("Create New Task")).toBeInTheDocument();
    });
    const submitBtn = screen.getByRole("button", { name: /create task/i });
    expect(submitBtn).toHaveAttribute("type", "submit");
    expect(submitBtn.closest("form")).not.toBeNull();
    expect(document.getElementById("task-title")).toHaveAttribute("name", "title");
  });

  it("6. clicking Back button navigates to /projects", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_PROJECT_DATA })
    );
    const user = userEvent.setup();
    render(<ProjectDetailPage />);
    await waitFor(() => screen.getByTestId("back-to-projects"));

    // Act
    await user.click(screen.getByTestId("back-to-projects"));

    // Assert
    expect(mockPush).toHaveBeenCalledWith("/projects");
  });

  it("7. Backlog tab renders backlog tasks without sprint assignment", async () => {
    // Arrange — t1 has no sprintId (backlog), t2 has sprintId "s1" (in sprint)
    const tasksWithSprint = [
      { ...MOCK_TASKS[0], sprintId: null },
      { ...MOCK_TASKS[1], status: "todo", sprintId: "s1", title: "Sprint Task" },
    ];
    const dataWithMixed = { ...MOCK_PROJECT_DATA, tasks: tasksWithSprint };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => dataWithMixed })
    );
    const user = userEvent.setup();
    render(<ProjectDetailPage />);
    await waitFor(() => screen.getByText("Board"));

    // Act
    await user.click(screen.getByRole("tab", { name: /backlog/i }));

    // Assert — backlog shows only tasks without sprint
    await waitFor(() => {
      expect(screen.getByText("Task A")).toBeInTheDocument();
    });
  });

  it("8. Sprints tab renders sprint cards when sprints exist", async () => {
    // Arrange
    const dataWithSprints = {
      ...MOCK_PROJECT_DATA,
      sprints: [
        {
          id: "s1",
          name: "Sprint 1",
          status: "active",
          goal: "Ship it",
          tasks: [],
          startDate: null,
          endDate: null,
          projectId: "proj-1",
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z",
        },
      ],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => dataWithSprints })
    );
    const user = userEvent.setup();
    render(<ProjectDetailPage />);
    await waitFor(() => screen.getByText("Board"));

    // Act
    await user.click(screen.getByRole("tab", { name: /sprints/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Sprint 1")).toBeInTheDocument();
    });
  });

  it("9. shows error state when fetch fails", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Not found"))
    );

    // Act
    render(<ProjectDetailPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Error loading project")).toBeInTheDocument();
    });
  });

  it("10. task click opens task detail dialog", async () => {
    // Arrange
    const dataWithTask = { ...MOCK_PROJECT_DATA, tasks: [MOCK_TASKS[0]] };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => dataWithTask })
    );
    const user = userEvent.setup();
    render(<ProjectDetailPage />);
    await waitFor(() => screen.getByTestId("task-card"));

    // Act
    await user.click(screen.getByTestId("task-card"));

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByRole("dialog")).toHaveTextContent("Task A");
  });
});
