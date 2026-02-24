import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IssuesPage from "@/app/(app)/issues/page";

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
  usePathname: () => "/issues",
}));

const MOCK_ISSUES_RESPONSE = {
  data: [
    {
      id: "i1",
      title: "Login button broken",
      status: "open",
      severity: "high",
      type: "bug",
      description: "Cannot log in",
      reproSteps: null,
      projectId: "p1",
      assigneeId: null,
      reporterId: "u1",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      project: { id: "p1", name: "Alpha", key: "AL" },
      reporter: { id: "u1", name: "Alice", email: "alice@example.com", image: null },
    },
    {
      id: "i2",
      title: "Dark mode feature",
      status: "in_progress",
      severity: "medium",
      type: "feature",
      description: "Add dark mode toggle",
      reproSteps: null,
      projectId: "p1",
      assigneeId: null,
      reporterId: "u1",
      createdAt: "2026-01-02T00:00:00Z",
      updatedAt: "2026-01-02T00:00:00Z",
      project: { id: "p1", name: "Alpha", key: "AL" },
      reporter: { id: "u1", name: "Alice", email: "alice@example.com", image: null },
    },
  ],
  pagination: { total: 2, page: 1, pageSize: 10, totalPages: 1 },
};

const EMPTY_RESPONSE = {
  data: [],
  pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
};

describe("IssuesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("should render issue list after data loads", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_ISSUES_RESPONSE,
      })
    );

    // Act
    render(<IssuesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Login button broken")).toBeInTheDocument();
    });
    expect(screen.getByText("Dark mode feature")).toBeInTheDocument();
    expect(screen.getByText("Issues")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new issue/i })).toBeInTheDocument();
  });

  it("should show empty state when no issues exist", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => EMPTY_RESPONSE,
      })
    );

    // Act
    render(<IssuesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("No issues found")).toBeInTheDocument();
    });
  });

  it("should filter visible issues by title with client-side search", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_ISSUES_RESPONSE,
      })
    );
    const user = userEvent.setup();
    render(<IssuesPage />);
    await waitFor(() => screen.getByText("Login button broken"));

    // Act
    await user.type(screen.getByPlaceholderText("Search issues..."), "Login");

    // Assert
    expect(screen.getByText("Login button broken")).toBeInTheDocument();
    expect(screen.queryByText("Dark mode feature")).not.toBeInTheDocument();
  });

  it("should open create issue dialog on New Issue click", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_ISSUES_RESPONSE,
      })
    );
    const user = userEvent.setup();
    render(<IssuesPage />);
    await waitFor(() => screen.getByText("Login button broken"));

    // Act
    await user.click(screen.getByRole("button", { name: /new issue/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Report New Issue")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /create issue/i })).toBeInTheDocument();
  });

  it("should close create dialog on Cancel click", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_ISSUES_RESPONSE,
      })
    );
    const user = userEvent.setup();
    render(<IssuesPage />);
    await waitFor(() => screen.getByText("Login button broken"));
    await user.click(screen.getByRole("button", { name: /new issue/i }));
    await waitFor(() => screen.getByText("Report New Issue"));

    // Act
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByText("Report New Issue")).not.toBeInTheDocument();
    });
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
    render(<IssuesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Error loading issues")).toBeInTheDocument();
    });
  });
});
