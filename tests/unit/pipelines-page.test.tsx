import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PipelinesPage from "@/app/(app)/pipelines/page";

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
  usePathname: () => "/pipelines",
}));

const MOCK_PIPELINE = {
  id: "pipe1",
  name: "Build & Deploy",
  status: "success",
  projectId: "p1",
  config: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  project: { id: "p1", name: "Alpha", key: "AL" },
  stages: [
    { id: "s1", name: "build", order: 1 },
    { id: "s2", name: "test", order: 2 },
  ],
  runs: [
    {
      id: "r1",
      status: "success",
      branch: "main",
      commitSha: "abc1234def",
      duration: 120,
      startedAt: "2026-01-01T00:00:00Z",
      finishedAt: "2026-01-01T00:02:00Z",
    },
  ],
};

const MOCK_PIPELINES_RESPONSE = {
  data: [MOCK_PIPELINE],
  pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
};

const EMPTY_RESPONSE = {
  data: [],
  pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
};

describe("PipelinesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("renders the page heading and pipeline cards after data loads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PIPELINES_RESPONSE,
      })
    );

    render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByText("Build & Deploy")).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: /CI\/CD Pipelines/i })).toBeInTheDocument();
  });

  it("shows empty state when no pipelines exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => EMPTY_RESPONSE,
      })
    );

    render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
    expect(screen.getByText("No pipelines configured")).toBeInTheDocument();
  });

  it("shows loading skeleton while data is loading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {}))
    );

    const { container } = render(<PipelinesPage />);

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByText("Build & Deploy")).not.toBeInTheDocument();
  });

  it("shows error state when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Server error" }),
      })
    );

    render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByText("Error loading pipelines")).toBeInTheDocument();
    });
  });

  it("renders Trigger Run button for each pipeline card", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PIPELINES_RESPONSE,
      })
    );

    render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByText("Build & Deploy")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /trigger run/i })).toBeInTheDocument();
  });

  it("renders Details toggle button for each pipeline card", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PIPELINES_RESPONSE,
      })
    );

    render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByText("Build & Deploy")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /details/i })).toBeInTheDocument();
  });

  it("expands pipeline details when Details button is clicked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PIPELINES_RESPONSE,
      })
    );

    const user = userEvent.setup();
    render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByText("Build & Deploy")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /details/i }));

    await waitFor(() => {
      expect(screen.getByText("build")).toBeInTheDocument();
    });
    expect(screen.getByText("test")).toBeInTheDocument();
  });

  it("collapses pipeline details when Details clicked again", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PIPELINES_RESPONSE,
      })
    );

    const user = userEvent.setup();
    render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByText("Build & Deploy")).toBeInTheDocument();
    });

    // Expand
    await user.click(screen.getByRole("button", { name: /details/i }));
    await waitFor(() => {
      expect(screen.getByText("build")).toBeInTheDocument();
    });

    // Collapse
    await user.click(screen.getByRole("button", { name: /details/i }));
    await waitFor(() => {
      expect(screen.queryByText("Stages")).not.toBeInTheDocument();
    });
  });

  it("renders project key and name in card description", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PIPELINES_RESPONSE,
      })
    );

    render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByText(/AL - Alpha/)).toBeInTheDocument();
    });
  });

  it("renders last run branch information", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_PIPELINES_RESPONSE,
      })
    );

    render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByText("main")).toBeInTheDocument();
    });
  });
});
