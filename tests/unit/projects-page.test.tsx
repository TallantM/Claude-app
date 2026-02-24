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
});
