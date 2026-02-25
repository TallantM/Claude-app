import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/(app)/dashboard/page";

const MOCK_DASHBOARD_RESPONSE = {
  data: {
    stats: {
      totalProjects: 5,
      totalTasks: 42,
      completedTasks: 18,
      openIssues: 7,
      activeSprints: 2,
      teamMembers: 8,
    },
    recentActivity: [
      {
        id: "1",
        type: "created",
        entity: "task",
        details: "Created task: Fix login bug",
        createdAt: "2026-01-10T10:00:00Z",
        user: { name: "Alice", image: null },
      },
    ],
    taskDistribution: [
      { label: "todo", value: 15 },
      { label: "in_progress", value: 9 },
      { label: "in_review", value: 0 },
      { label: "done", value: 18 },
    ],
  },
};

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should render all six stat card labels after data loads", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_DASHBOARD_RESPONSE,
      })
    );

    // Act
    render(<DashboardPage />);

    // Assert — wait for loading to finish and stat labels to appear
    await waitFor(() => {
      expect(screen.getByText("Total Projects")).toBeInTheDocument();
    });
    // "Total Tasks" appears twice (stat card + task distribution summary)
    expect(screen.getAllByText("Total Tasks").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Completed Tasks")).toBeInTheDocument();
    expect(screen.getByText("Open Issues")).toBeInTheDocument();
    expect(screen.getByText("Active Sprints")).toBeInTheDocument();
    expect(screen.getByText("Team Members")).toBeInTheDocument();
  });

  it("should display the correct numeric values in stat cards", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_DASHBOARD_RESPONSE,
      })
    );

    // Act
    render(<DashboardPage />);

    // Assert — check specific values from the mock response
    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument(); // totalProjects
    });
    expect(screen.getByText("7")).toBeInTheDocument(); // openIssues
    expect(screen.getByText("8")).toBeInTheDocument(); // teamMembers
  });

  it("should show Recent Activity section with activity items", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_DASHBOARD_RESPONSE,
      })
    );

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Recent Activity")).toBeInTheDocument();
    });
    expect(screen.getByText("Created task: Fix login bug")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("should show Task Distribution section with status labels", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_DASHBOARD_RESPONSE,
      })
    );

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Task Distribution")).toBeInTheDocument();
    });
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("should show empty activity message when no activity exists", async () => {
    // Arrange
    const emptyResponse = {
      data: {
        ...MOCK_DASHBOARD_RESPONSE.data,
        recentActivity: [],
      },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => emptyResponse,
      })
    );

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("No recent activity")).toBeInTheDocument();
    });
  });

  it("should show error state when fetch fails", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Internal server error" }),
      })
    );

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Error loading dashboard")).toBeInTheDocument();
    });
  });

  it("should show loading skeleton while dashboard data is loading", async () => {
    // Arrange — fetch never resolves, keeping loading=true
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {}))
    );

    // Act
    const { container } = render(<DashboardPage />);

    // Assert — skeleton is visible; stat card labels not yet rendered
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByText("Total Projects")).not.toBeInTheDocument();
  });
});
