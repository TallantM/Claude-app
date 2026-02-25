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

  it("should show loading skeleton while issues are loading", async () => {
    // Arrange — fetch never resolves, keeping loading=true
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {}))
    );

    // Act
    const { container } = render(<IssuesPage />);

    // Assert — skeleton is visible; no issue rows rendered yet
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByText("Login button broken")).not.toBeInTheDocument();
  });

  it("should POST to /api/issues and refresh the list on submit", async () => {
    // Arrange
    const NEW_ISSUE = {
      id: "i3",
      title: "New Critical Bug",
      status: "open",
      severity: "critical",
      type: "bug",
      description: "",
      reproSteps: null,
      projectId: null,
      assigneeId: null,
      reporterId: "u1",
      createdAt: "2026-01-03T00:00:00Z",
      updatedAt: "2026-01-03T00:00:00Z",
      project: null,
      reporter: { id: "u1", name: "Alice", email: "alice@example.com", image: null },
    };
    const UPDATED_RESPONSE = {
      data: [...MOCK_ISSUES_RESPONSE.data, NEW_ISSUE],
      pagination: { total: 3, page: 1, pageSize: 10, totalPages: 1 },
    };
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_ISSUES_RESPONSE })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "i3" }) })
      .mockResolvedValue({ ok: true, json: async () => UPDATED_RESPONSE });
    vi.stubGlobal("fetch", mockFetch);

    const user = userEvent.setup();
    render(<IssuesPage />);
    await waitFor(() => screen.getByText("Login button broken"));

    // Open create dialog
    await user.click(screen.getByRole("button", { name: /new issue/i }));
    await waitFor(() => screen.getByText("Report New Issue"));

    // Fill form
    await user.type(screen.getByLabelText("Title"), "New Critical Bug");

    // Submit
    await user.click(screen.getByRole("button", { name: /create issue/i }));

    // Assert POST was called with the right data
    await waitFor(() => {
      const postCall = mockFetch.mock.calls.find(
        (args) => args[1]?.method === "POST"
      );
      expect(postCall).toBeDefined();
      expect(postCall![0]).toBe("/api/issues");
      const body = JSON.parse(postCall![1].body);
      expect(body.title).toBe("New Critical Bug");
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
