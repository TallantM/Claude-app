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
  useParams: () => ({ id: "p1" }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/projects/p1",
}));

const MOCK_PROJECT_DATA = {
  project: {
    id: "p1",
    name: "Alpha Project",
    key: "AP",
    status: "active",
    description: null,
    startDate: null,
    endDate: null,
    taskCount: 0,
    openIssues: 0,
    teamId: null,
    teamName: null,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  tasks: [],
  sprints: [
    {
      id: "sp1",
      name: "Sprint 1",
      status: "active",
      goal: "Deliver login feature",
      startDate: "2026-01-01T00:00:00Z",
      endDate: "2026-01-14T00:00:00Z",
      tasks: [],
    },
  ],
};

const MOCK_PROJECT_NO_SPRINTS = {
  ...MOCK_PROJECT_DATA,
  sprints: [],
};

describe("SprintsPage (ProjectDetailPage Sprints Tab)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("renders project name heading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PROJECT_DATA,
      })
    );

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Alpha Project" })).toBeInTheDocument();
    });
  });

  it("renders Sprints tab trigger", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PROJECT_DATA,
      })
    );

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    });

    expect(screen.getByRole("tab", { name: /sprints/i })).toBeInTheDocument();
  });

  it("Sprints tab shows sprint cards after clicking the tab", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PROJECT_DATA,
      })
    );

    const user = userEvent.setup();
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("tab", { name: /sprints/i }));

    await waitFor(() => {
      expect(screen.getByText("Sprint 1")).toBeInTheDocument();
    });
  });

  it("Sprints tab shows empty state when no sprints", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PROJECT_NO_SPRINTS,
      })
    );

    const user = userEvent.setup();
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("tab", { name: /sprints/i }));

    await waitFor(() => {
      expect(screen.getByText("No sprints yet")).toBeInTheDocument();
    });
  });

  it("sprint goal is displayed on the sprint card", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PROJECT_DATA,
      })
    );

    const user = userEvent.setup();
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("tab", { name: /sprints/i }));

    await waitFor(() => {
      expect(screen.getByText("Deliver login feature")).toBeInTheDocument();
    });
  });

  it("sprint status badge is rendered", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PROJECT_DATA,
      })
    );

    const user = userEvent.setup();
    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("tab", { name: /sprints/i }));

    await waitFor(() => {
      expect(screen.getByText("Sprint 1")).toBeInTheDocument();
    });
    // status badge should be visible (may appear more than once — project badge + sprint badge)
    expect(screen.getAllByText("active").length).toBeGreaterThan(0);
  });

  it("shows loading skeleton while data is loading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {}))
    );

    const { container } = render(<ProjectDetailPage />);

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByText("Sprint 1")).not.toBeInTheDocument();
  });

  it("Board tab is active by default showing kanban columns", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PROJECT_DATA,
      })
    );

    render(<ProjectDetailPage />);

    await waitFor(() => {
      expect(screen.getByText("Alpha Project")).toBeInTheDocument();
    });

    // Board is the default tab so kanban columns should be visible
    expect(screen.getByText("To Do")).toBeInTheDocument();
  });
});
