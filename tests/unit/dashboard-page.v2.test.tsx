/**
 * Dashboard unit tests matching spec scenarios 1-10.
 * The existing dashboard-page.test.tsx covers scenarios partially —
 * this file covers the remaining spec scenarios with matching numbering.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/(app)/dashboard/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/dashboard",
}));

const MOCK_RESPONSE = {
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
      details: "Fix login bug",
      createdAt: "2026-01-01T00:00:00Z",
      user: { name: "Alice", image: null },
    },
  ],
  taskDistribution: [
    { label: "todo", value: 10 },
    { label: "in_progress", value: 5 },
    { label: "in_review", value: 2 },
    { label: "done", value: 8 },
  ],
};

describe("DashboardPage (spec scenarios)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. shows loading skeleton while fetch is pending", () => {
    // Arrange
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise(() => {})));

    // Act
    const { container } = render(<DashboardPage />);

    // Assert
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByText("Total Projects")).not.toBeInTheDocument();
  });

  it("2. renders all six stat cards after successful data fetch", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("stat-card-projects")).toBeInTheDocument();
    });
    expect(screen.getByTestId("stat-card-tasks")).toBeInTheDocument();
    expect(screen.getByTestId("stat-card-completed-tasks")).toBeInTheDocument();
    expect(screen.getByTestId("stat-card-issues")).toBeInTheDocument();
    expect(screen.getByTestId("stat-card-sprints")).toBeInTheDocument();
    expect(screen.getByTestId("stat-card-team")).toBeInTheDocument();
  });

  it("3. displays correct numeric values from API response", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );

    // Act
    render(<DashboardPage />);

    // Assert — scope by testid to avoid matching task distribution count numbers
    await waitFor(() => {
      expect(screen.getByTestId("stat-card-projects")).toHaveTextContent("5");
    });
    expect(screen.getByTestId("stat-card-issues")).toHaveTextContent("7");
    expect(screen.getByTestId("stat-card-team")).toHaveTextContent("8");
  });

  it("4. renders activity feed card and shows activity items", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("activity-feed")).toBeInTheDocument();
    });
    expect(screen.getByText("Fix login bug")).toBeInTheDocument();
  });

  it("5. shows \"No recent activity\" when recentActivity array is empty", async () => {
    // Arrange
    const emptyActivity = { ...MOCK_RESPONSE, recentActivity: [] };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => emptyActivity })
    );

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("No recent activity")).toBeInTheDocument();
    });
  });

  it("6. renders task distribution bars for all four statuses", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );

    // Act
    const { container } = render(<DashboardPage />);

    // Assert — task distribution testids use replace(/_/g, '-')
    await waitFor(() => {
      expect(container.querySelector('[data-testid="task-dist-todo"]')).toBeInTheDocument();
    });
    expect(container.querySelector('[data-testid="task-dist-in-progress"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="task-dist-in-review"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="task-dist-done"]')).toBeInTheDocument();
  });

  it("7. calculates completion rate correctly", async () => {
    // Arrange
    const payload = {
      ...MOCK_RESPONSE,
      stats: { ...MOCK_RESPONSE.stats, totalTasks: 10, completedTasks: 4 },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => payload })
    );

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("40%")).toBeInTheDocument();
    });
  });

  it("8. shows 0% completion rate when totalTasks is zero", async () => {
    // Arrange
    const payload = {
      ...MOCK_RESPONSE,
      stats: { ...MOCK_RESPONSE.stats, totalTasks: 0, completedTasks: 0 },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => payload })
    );

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("0%")).toBeInTheDocument();
    });
  });

  it("9. shows error state when fetch rejects", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network error"))
    );

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Error loading dashboard")).toBeInTheDocument();
    });
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });

  it("10. calls /api/dashboard on mount", async () => {
    // Arrange
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_RESPONSE,
    });
    vi.stubGlobal("fetch", mockFetch);

    // Act
    render(<DashboardPage />);

    // Assert
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith("/api/dashboard");
    });
  });
});
