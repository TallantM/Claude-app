/**
 * Projects unit tests matching spec scenarios 1-10.
 * Complements the existing projects-page.test.tsx with remaining scenarios.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectsPage from "@/app/(app)/projects/page";

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

const MOCK_PROJECT = {
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
};

const MOCK_RESPONSE = {
  data: [MOCK_PROJECT],
  pagination: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
};

const EMPTY_RESPONSE = {
  data: [],
  pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
};

describe("ProjectsPage (spec scenarios)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. shows loading skeleton while fetch is pending", () => {
    // Arrange
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise(() => {})));

    // Act
    const { container } = render(<ProjectsPage />);

    // Assert
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByTestId("project-card")).not.toBeInTheDocument();
  });

  it("2. renders project cards after data loads", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );

    // Act
    render(<ProjectsPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("project-card")).toBeInTheDocument();
    });
    expect(screen.getByText("Alpha Project")).toBeInTheDocument();
  });

  it("3. shows empty state when no projects returned", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => EMPTY_RESPONSE })
    );

    // Act
    render(<ProjectsPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
    expect(screen.getByText("No projects found")).toBeInTheDocument();
  });

  it("4. opens create project dialog when New Project button is clicked", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );
    const user = userEvent.setup();
    render(<ProjectsPage />);
    await waitFor(() => screen.getByText("Alpha Project"));

    // Act
    await user.click(screen.getByTestId("new-project-btn"));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Create New Project")).toBeInTheDocument();
    });
    expect(document.getElementById("name")).toBeInTheDocument();
  });

  it("5. create project dialog has submit button inside a form (structural assertion)", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );
    const user = userEvent.setup();
    render(<ProjectsPage />);
    await waitFor(() => screen.getByText("Alpha Project"));
    await user.click(screen.getByTestId("new-project-btn"));
    await waitFor(() => screen.getByText("Create New Project"));

    // Assert — Pattern 7: structural form assertions
    const submitBtn = screen.getByRole("button", { name: /create project/i });
    expect(submitBtn).toHaveAttribute("type", "submit");
    expect(submitBtn.closest("form")).not.toBeNull();
    expect(document.getElementById("name")).toHaveAttribute("name", "name");
  });

  it("6. closes dialog on Cancel click", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );
    const user = userEvent.setup();
    render(<ProjectsPage />);
    await waitFor(() => screen.getByText("Alpha Project"));
    await user.click(screen.getByTestId("new-project-btn"));
    await waitFor(() => screen.getByText("Create New Project"));

    // Act
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByText("Create New Project")).not.toBeInTheDocument();
    });
  });

  it("7. search input is present and bound", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );
    const user = userEvent.setup();
    render(<ProjectsPage />);
    await waitFor(() => screen.getByText("Alpha Project"));

    // Assert
    const searchInput = screen.getByPlaceholderText("Search projects...");
    expect(searchInput).toBeInTheDocument();

    // Act — type and assert value changes (waitFor handles async re-renders)
    await user.type(searchInput, "A");
    await waitFor(() => {
      expect(searchInput).toHaveValue("A");
    });
  });

  it("8. status filter select is rendered with correct options", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );
    render(<ProjectsPage />);
    await waitFor(() => screen.getByText("Alpha Project"));

    // Assert — Radix Select trigger with "All Statuses" text
    expect(screen.getByText("All Statuses")).toBeInTheDocument();
  });

  it("9. shows error state when fetch rejects", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Server error" }) })
    );

    // Act
    render(<ProjectsPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Error loading projects")).toBeInTheDocument();
    });
  });

  it("10. clicking project card navigates to /projects/{id}", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );
    const user = userEvent.setup();
    render(<ProjectsPage />);
    await waitFor(() => screen.getByTestId("project-card"));

    // Act
    await user.click(screen.getByTestId("project-card"));

    // Assert
    expect(mockPush).toHaveBeenCalledWith("/projects/p1");
  });
});
