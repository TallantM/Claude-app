import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReposPage from "@/app/(app)/repos/page";

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
  usePathname: () => "/repos",
}));

const MOCK_REPOS_RESPONSE = {
  data: [
    {
      id: "r1",
      name: "my-app",
      url: "https://github.com/org/my-app",
      provider: "github",
      projectId: "p1",
      defaultBranch: "main",
      createdAt: "2026-01-01T00:00:00Z",
      project: { id: "p1", name: "Alpha", key: "AL" },
    },
  ],
};

const MOCK_PROJECTS_RESPONSE = {
  data: [{ id: "p1", name: "Alpha" }],
};

const EMPTY_REPOS_RESPONSE = { data: [] };

function makeFetch(reposData: object = MOCK_REPOS_RESPONSE) {
  return vi.fn().mockImplementation((url: string) => {
    if (String(url).includes("/api/projects")) {
      return Promise.resolve({
        ok: true,
        json: async () => MOCK_PROJECTS_RESPONSE,
      });
    }
    return Promise.resolve({
      ok: true,
      json: async () => reposData,
    });
  });
}

describe("ReposPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("renders heading and Connect Repository button", async () => {
    vi.stubGlobal("fetch", makeFetch());

    render(<ReposPage />);

    await waitFor(() => {
      expect(screen.getByText("my-app")).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: /repositories/i })).toBeInTheDocument();
    expect(screen.getByTestId("connect-repo-btn")).toBeInTheDocument();
  });

  it("renders repo cards after data loads", async () => {
    vi.stubGlobal("fetch", makeFetch());

    render(<ReposPage />);

    await waitFor(() => {
      expect(screen.getByText("my-app")).toBeInTheDocument();
    });
    expect(screen.getByTestId("repo-card")).toBeInTheDocument();
  });

  it("shows empty state when no repos exist", async () => {
    vi.stubGlobal("fetch", makeFetch(EMPTY_REPOS_RESPONSE));

    render(<ReposPage />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
    expect(screen.getByText("No repositories connected")).toBeInTheDocument();
  });

  it("shows loading skeleton while data is loading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {}))
    );

    const { container } = render(<ReposPage />);

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByText("my-app")).not.toBeInTheDocument();
  });

  it("shows error state when fetch fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Server error" }),
      })
    );

    render(<ReposPage />);

    await waitFor(() => {
      expect(screen.getByText("Error loading repositories")).toBeInTheDocument();
    });
  });

  it("opens Connect Repository dialog on button click", async () => {
    vi.stubGlobal("fetch", makeFetch());

    const user = userEvent.setup();
    render(<ReposPage />);

    await waitFor(() => {
      expect(screen.getByText("my-app")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("connect-repo-btn"));

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    // Dialog title
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Repository Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Repository URL")).toBeInTheDocument();
  });

  it("closes dialog on Cancel click", async () => {
    vi.stubGlobal("fetch", makeFetch());

    const user = userEvent.setup();
    render(<ReposPage />);

    await waitFor(() => {
      expect(screen.getByText("my-app")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("connect-repo-btn"));
    await waitFor(() => screen.getByRole("dialog"));

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("Connect Repository submit button has type='submit' inside a form", async () => {
    vi.stubGlobal("fetch", makeFetch());

    const user = userEvent.setup();
    render(<ReposPage />);

    await waitFor(() => {
      expect(screen.getByText("my-app")).toBeInTheDocument();
    });

    await user.click(screen.getByTestId("connect-repo-btn"));
    await waitFor(() => screen.getByRole("dialog"));

    const submitBtn = screen.getByRole("button", { name: /connect repository/i });
    expect(submitBtn).toHaveAttribute("type", "submit");
    expect(submitBtn.closest("form")).not.toBeNull();
  });

  it("renders repo URL as a link in the card", async () => {
    vi.stubGlobal("fetch", makeFetch());

    render(<ReposPage />);

    await waitFor(() => {
      expect(screen.getByText("my-app")).toBeInTheDocument();
    });

    const link = screen.getByRole("link", { name: /github\.com\/org\/my-app/i });
    expect(link).toHaveAttribute("href", "https://github.com/org/my-app");
  });

  it("renders default branch information in card", async () => {
    vi.stubGlobal("fetch", makeFetch());

    render(<ReposPage />);

    await waitFor(() => {
      expect(screen.getByText("my-app")).toBeInTheDocument();
    });

    expect(screen.getByText("main")).toBeInTheDocument();
  });
});
