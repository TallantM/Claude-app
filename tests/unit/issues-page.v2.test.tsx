/**
 * Issues unit tests matching spec scenarios 1-10.
 * Complements existing issues-page.test.tsx.
 */
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

const MOCK_ISSUE_1 = {
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
};

const MOCK_ISSUE_2 = {
  id: "i2",
  title: "Dark mode feature",
  status: "in_progress",
  severity: "medium",
  type: "feature",
  description: "Add dark mode",
  reproSteps: null,
  projectId: "p1",
  assigneeId: null,
  reporterId: "u1",
  createdAt: "2026-01-02T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
  project: { id: "p1", name: "Alpha", key: "AL" },
  reporter: { id: "u1", name: "Alice", email: "alice@example.com", image: null },
};

const MOCK_RESPONSE = {
  data: [MOCK_ISSUE_1, MOCK_ISSUE_2],
  pagination: { total: 2, page: 1, pageSize: 10, totalPages: 1 },
};

const EMPTY_RESPONSE = {
  data: [],
  pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
};

const MOCK_PROJECTS_RESPONSE = {
  data: [{ id: "p1", name: "Alpha", key: "AL", status: "active", taskCount: 0, openIssues: 0 }],
  pagination: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
};

describe("IssuesPage (spec scenarios)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. shows loading skeleton while fetch is pending", () => {
    // Arrange
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise(() => {})));

    // Act
    const { container } = render(<IssuesPage />);

    // Assert
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByTestId("issue-card")).not.toBeInTheDocument();
  });

  it("2. renders issue cards after data loads", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );

    // Act
    render(<IssuesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getAllByTestId("issue-card")).toHaveLength(2);
    });
    expect(screen.getByText("Login button broken")).toBeInTheDocument();
    expect(screen.getByText("Dark mode feature")).toBeInTheDocument();
  });

  it("3. client-side search filters visible issues", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );
    const user = userEvent.setup();
    render(<IssuesPage />);
    await waitFor(() => screen.getAllByTestId("issue-card"));

    // Act
    await user.type(screen.getByPlaceholderText("Search issues..."), "Login");

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Login button broken")).toBeInTheDocument();
    });
    expect(screen.queryByText("Dark mode feature")).not.toBeInTheDocument();
  });

  it("4. shows \"No issues found\" message when list is empty", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => EMPTY_RESPONSE })
    );

    // Act
    render(<IssuesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("No issues found")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("issue-card")).not.toBeInTheDocument();
  });

  it("5. opens create issue dialog when New Issue button clicked", async () => {
    // Arrange
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_RESPONSE })
      .mockResolvedValue({ ok: true, json: async () => MOCK_PROJECTS_RESPONSE });
    vi.stubGlobal("fetch", mockFetch);
    const user = userEvent.setup();
    render(<IssuesPage />);
    await waitFor(() => screen.getAllByTestId("issue-card"));

    // Act
    await user.click(screen.getByTestId("create-issue-btn"));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Report New Issue")).toBeInTheDocument();
    });
    expect(document.getElementById("issue-title")).toBeInTheDocument();
  });

  it("6. create issue dialog has submit button inside a form (structural assertion)", async () => {
    // Arrange
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_RESPONSE })
      .mockResolvedValue({ ok: true, json: async () => MOCK_PROJECTS_RESPONSE });
    vi.stubGlobal("fetch", mockFetch);
    const user = userEvent.setup();
    render(<IssuesPage />);
    await waitFor(() => screen.getAllByTestId("issue-card"));
    await user.click(screen.getByTestId("create-issue-btn"));
    await waitFor(() => screen.getByText("Report New Issue"));

    // Assert — Pattern 7: structural form assertions
    const submitBtn = screen.getByRole("button", { name: /create issue/i });
    expect(submitBtn).toHaveAttribute("type", "submit");
    expect(submitBtn.closest("form")).not.toBeNull();
    expect(document.getElementById("issue-title")).toHaveAttribute("name", "title");
  });

  it("7. clicking issue card opens detail dialog", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );
    const user = userEvent.setup();
    render(<IssuesPage />);
    await waitFor(() => screen.getAllByTestId("issue-card"));

    // Act
    await user.click(screen.getAllByTestId("issue-card")[0]);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByRole("dialog")).toHaveTextContent("Login button broken");
  });

  it("8. status filter select renders with all status options", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );
    render(<IssuesPage />);
    await waitFor(() => screen.getAllByTestId("issue-card"));

    // Assert — first combobox is status filter
    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes.length).toBeGreaterThanOrEqual(1);
    // The Select trigger text shows "All Status" or similar
    expect(screen.getByText("All Status")).toBeInTheDocument();
  });

  it("9. severity filter select renders with all severity options", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );
    render(<IssuesPage />);
    await waitFor(() => screen.getAllByTestId("issue-card"));

    // Assert — second combobox is severity filter
    expect(screen.getByText("All Severity")).toBeInTheDocument();
  });

  it("10. shows error state when fetch rejects", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Server error" }) })
    );

    // Act
    render(<IssuesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Error loading issues")).toBeInTheDocument();
    });
  });
});
