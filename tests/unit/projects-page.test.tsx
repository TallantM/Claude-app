import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectsPage from "@/app/(app)/projects/page";

// Override next/navigation for this test file
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
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/projects",
}));

const MOCK_PROJECTS_RESPONSE = {
  data: [
    {
      id: "p1",
      name: "Alpha Project",
      key: "AP",
      status: "active",
      description: "First project",
      taskCount: 5,
      openIssues: 2,
      teamName: null,
      startDate: null,
      endDate: null,
      teamId: null,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    },
  ],
  pagination: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
};

const EMPTY_RESPONSE = {
  data: [],
  pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
};

describe("ProjectsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("should render project cards after data loads", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PROJECTS_RESPONSE,
      })
    );

    // Act
    render(<ProjectsPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    });
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new project/i })).toBeInTheDocument();
  });

  it("should show empty state when no projects exist", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => EMPTY_RESPONSE,
      })
    );

    // Act
    render(<ProjectsPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("No projects found")).toBeInTheDocument();
    });
  });

  it("should open create project dialog when New Project button is clicked", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PROJECTS_RESPONSE,
      })
    );
    const user = userEvent.setup();
    render(<ProjectsPage />);
    await waitFor(() => screen.getByText("Alpha Project"));

    // Act
    await user.click(screen.getByRole("button", { name: /new project/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Create New Project")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /create project/i })).toBeInTheDocument();
  });

  it("should close dialog when Cancel is clicked", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PROJECTS_RESPONSE,
      })
    );
    const user = userEvent.setup();
    render(<ProjectsPage />);
    await waitFor(() => screen.getByText("Alpha Project"));
    await user.click(screen.getByRole("button", { name: /new project/i }));
    await waitFor(() => screen.getByText("Create New Project"));

    // Act
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByText("Create New Project")).not.toBeInTheDocument();
    });
  });

  it("should show search input on the page", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PROJECTS_RESPONSE,
      })
    );

    // Act
    render(<ProjectsPage />);
    await waitFor(() => screen.getByText("Alpha Project"));

    // Assert
    expect(screen.getByPlaceholderText("Search projects...")).toBeInTheDocument();
  });

  it("should show error state when fetch fails", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Server error" }),
      })
    );

    // Act
    render(<ProjectsPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Error loading projects")).toBeInTheDocument();
    });
  });

  it("should show loading skeleton while projects are loading", async () => {
    // Arrange — fetch never resolves, keeping loading=true
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {}))
    );

    // Act
    const { container } = render(<ProjectsPage />);

    // Assert — skeleton is visible; no project cards rendered yet
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByText("Alpha Project")).not.toBeInTheDocument();
  });

  it("should POST to /api/projects and refresh the list on submit", async () => {
    // Arrange
    const UPDATED_RESPONSE = {
      data: [
        ...MOCK_PROJECTS_RESPONSE.data,
        {
          id: "p2",
          name: "Beta Project",
          key: "BETA",
          status: "active",
          description: "",
          taskCount: 0,
          openIssues: 0,
          teamName: null,
          startDate: null,
          endDate: null,
          teamId: null,
          createdAt: "2026-01-02T00:00:00Z",
          updatedAt: "2026-01-02T00:00:00Z",
        },
      ],
      pagination: { total: 2, page: 1, pageSize: 10, totalPages: 1 },
    };
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_PROJECTS_RESPONSE })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "p2" }) })
      .mockResolvedValue({ ok: true, json: async () => UPDATED_RESPONSE });
    vi.stubGlobal("fetch", mockFetch);

    const user = userEvent.setup();
    render(<ProjectsPage />);
    await waitFor(() => screen.getByText("Alpha Project"));

    // Open create dialog
    await user.click(screen.getByRole("button", { name: /new project/i }));
    await waitFor(() => screen.getByText("Create New Project"));

    // Fill form
    await user.type(screen.getByLabelText("Project Name"), "Beta Project");

    // Submit
    await user.click(screen.getByRole("button", { name: /create project/i }));

    // Assert POST was called with the right data
    await waitFor(() => {
      const postCall = mockFetch.mock.calls.find(
        (args) => args[1]?.method === "POST"
      );
      expect(postCall).toBeDefined();
      expect(postCall![0]).toBe("/api/projects");
      const body = JSON.parse(postCall![1].body);
      expect(body.name).toBe("Beta Project");
    });

    // Assert GET was called again after POST (refetch)
    await waitFor(() => {
      const getCalls = mockFetch.mock.calls.filter(
        (args) => !args[1]?.method || args[1]?.method === "GET"
      );
      expect(getCalls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
