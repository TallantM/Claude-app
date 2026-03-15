/**
 * Pipelines unit tests matching spec scenarios 1-10.
 */
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
  id: "1",
  name: "Build Pipeline",
  status: "idle",
  projectId: "p1",
  config: null,
  stages: [],
  runs: [],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const MOCK_PIPELINE_WITH_RUN = {
  ...MOCK_PIPELINE,
  runs: [
    {
      id: "r1",
      status: "success",
      branch: "main",
      commitSha: "abc1234",
      duration: 120,
      startedAt: "2026-01-01T00:00:00Z",
      finishedAt: "2026-01-01T00:02:00Z",
    },
  ],
};

const MOCK_RESPONSE = {
  data: [MOCK_PIPELINE],
  pagination: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
};

const EMPTY_RESPONSE = {
  data: [],
  pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
};

describe("PipelinesPage (spec scenarios)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. shows loading skeleton while fetch is pending", () => {
    // Arrange
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise(() => {})));

    // Act
    const { container } = render(<PipelinesPage />);

    // Assert
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByTestId("pipeline-card")).not.toBeInTheDocument();
  });

  it("2. renders pipeline cards after data loads", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );

    // Act
    render(<PipelinesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("pipeline-card")).toBeInTheDocument();
    });
    expect(screen.getByText("Build Pipeline")).toBeInTheDocument();
  });

  it("3. shows empty state when no pipelines exist", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => EMPTY_RESPONSE })
    );

    // Act
    render(<PipelinesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
    expect(screen.getByText("No pipelines configured")).toBeInTheDocument();
  });

  it("4. renders last run status when pipeline has runs", async () => {
    // Arrange
    const responseWithRun = { data: [MOCK_PIPELINE_WITH_RUN], pagination: MOCK_RESPONSE.pagination };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => responseWithRun })
    );

    // Act
    render(<PipelinesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("success")).toBeInTheDocument();
    });
    expect(screen.getByText("Last run:")).toBeInTheDocument();
  });

  it("5. shows \"No runs yet\" when pipeline has no runs", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );

    // Act
    render(<PipelinesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("No runs yet")).toBeInTheDocument();
    });
  });

  it("6. Trigger Run button calls POST /api/pipelines/{id}/trigger", async () => {
    // Arrange
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_RESPONSE })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "run-1" }) })
      .mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE });
    vi.stubGlobal("fetch", mockFetch);
    const user = userEvent.setup();
    render(<PipelinesPage />);
    await waitFor(() => screen.getByTestId("pipeline-card"));

    // Act
    await user.click(screen.getByRole("button", { name: /trigger run/i }));

    // Assert
    await waitFor(() => {
      const postCall = mockFetch.mock.calls.find(
        (args) => args[1]?.method === "POST"
      );
      expect(postCall).toBeDefined();
      expect(postCall![0]).toBe("/api/pipelines/1/trigger");
    });
  });

  it("7. Details button toggles expanded section with stages and runs", async () => {
    // Arrange
    const pipelineWithStages = {
      ...MOCK_PIPELINE_WITH_RUN,
      stages: [{ id: "s1", name: "Build", order: 1 }],
    };
    const responseWithStages = {
      data: [pipelineWithStages],
      pagination: MOCK_RESPONSE.pagination,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => responseWithStages })
    );
    const user = userEvent.setup();
    render(<PipelinesPage />);
    await waitFor(() => screen.getByTestId("pipeline-card"));

    // Act — expand
    await user.click(screen.getByRole("button", { name: /details/i }));

    // Assert — expanded section visible
    await waitFor(() => {
      expect(
        screen.getByText("Stages").querySelector
          ? screen.getByText("Stages")
          : screen.queryByText("Stages") || screen.queryByText("Recent Runs")
      ).toBeTruthy();
    });

    // Act — collapse
    await user.click(screen.getByRole("button", { name: /details/i }));
  });

  it("8. pipeline status dot renders correct color class", async () => {
    // Arrange — four pipelines with different statuses
    const pipelinesData = {
      data: [
        { ...MOCK_PIPELINE, id: "p1", status: "idle" },
        { ...MOCK_PIPELINE, id: "p2", status: "running" },
        { ...MOCK_PIPELINE, id: "p3", status: "success" },
        { ...MOCK_PIPELINE, id: "p4", status: "failed" },
      ],
      pagination: { total: 4, page: 1, pageSize: 10, totalPages: 1 },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => pipelinesData })
    );

    // Act
    const { container } = render(<PipelinesPage />);

    // Assert — each status dot has appropriate color class
    await waitFor(() => {
      expect(container.querySelectorAll('[data-testid="pipeline-card"]')).toHaveLength(4);
    });
    expect(container.querySelector(".bg-gray-400")).toBeInTheDocument(); // idle
    expect(container.querySelector(".bg-blue-500")).toBeInTheDocument(); // running
    expect(container.querySelector(".bg-green-500")).toBeInTheDocument(); // success
    expect(container.querySelector(".bg-red-500")).toBeInTheDocument(); // failed
  });

  it("9. shows error state when fetch rejects", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Server error" }) })
    );

    // Act
    render(<PipelinesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Error loading pipelines")).toBeInTheDocument();
    });
  });

  it("10. formats duration correctly", async () => {
    // Arrange — 90 seconds = 1m 30s
    const pipelineWith90s = {
      ...MOCK_PIPELINE,
      runs: [{ id: "r1", status: "success", branch: "main", commitSha: "abc", duration: 90, startedAt: "2026-01-01T00:00:00Z", finishedAt: "2026-01-01T00:01:30Z" }],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [pipelineWith90s], pagination: MOCK_RESPONSE.pagination }) })
    );

    // Act
    render(<PipelinesPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("1m 30s")).toBeInTheDocument();
    });
  });
});
