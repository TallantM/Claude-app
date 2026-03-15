/**
 * Repos unit tests matching spec scenarios 1-10.
 */
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

const MOCK_REPO = {
  id: "1",
  name: "my-app",
  url: "https://github.com/org/my-app",
  provider: "github",
  projectId: null,
  defaultBranch: "main",
  createdAt: "2026-01-01T00:00:00Z",
};

const MOCK_REPOS_RESPONSE = { data: [MOCK_REPO] };
const EMPTY_REPOS_RESPONSE = { data: [] };
const MOCK_PROJECTS_RESPONSE = { data: [] };

describe("ReposPage (spec scenarios)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. shows loading skeleton while fetch is pending", () => {
    // Arrange
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise(() => {})));

    // Act
    const { container } = render(<ReposPage />);

    // Assert
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    expect(screen.queryByTestId("repo-card")).not.toBeInTheDocument();
  });

  it("2. renders repo cards after data loads", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => MOCK_REPOS_RESPONSE })
        .mockResolvedValue({ ok: true, json: async () => MOCK_PROJECTS_RESPONSE })
    );

    // Act
    render(<ReposPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("repo-card")).toBeInTheDocument();
    });
    expect(screen.getByText("my-app")).toBeInTheDocument();
  });

  it("3. shows empty state when no repos connected", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => EMPTY_REPOS_RESPONSE })
        .mockResolvedValue({ ok: true, json: async () => MOCK_PROJECTS_RESPONSE })
    );

    // Act
    render(<ReposPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
    expect(screen.getByText("No repositories connected")).toBeInTheDocument();
  });

  it("4. opens connect repo dialog when button clicked", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => EMPTY_REPOS_RESPONSE })
        .mockResolvedValue({ ok: true, json: async () => MOCK_PROJECTS_RESPONSE })
    );
    const user = userEvent.setup();
    render(<ReposPage />);
    await waitFor(() => screen.getByTestId("connect-repo-btn"));

    // Act
    await user.click(screen.getByTestId("connect-repo-btn"));

    // Assert — dialog heading (not the page button)
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByRole("dialog")).toHaveTextContent("Connect Repository");
    expect(document.getElementById("repo-name")).toBeInTheDocument();
  });

  it("5. connect repo dialog has submit button inside a form (structural assertion)", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => EMPTY_REPOS_RESPONSE })
        .mockResolvedValue({ ok: true, json: async () => MOCK_PROJECTS_RESPONSE })
    );
    const user = userEvent.setup();
    render(<ReposPage />);
    await waitFor(() => screen.getByTestId("connect-repo-btn"));
    await user.click(screen.getByTestId("connect-repo-btn"));
    await waitFor(() => screen.getByRole("dialog"));

    // Assert — Pattern 7: structural form assertions
    const submitBtn = screen.getByRole("button", { name: /connect repository/i });
    expect(submitBtn).toHaveAttribute("type", "submit");
    expect(submitBtn.closest("form")).not.toBeNull();
    expect(document.getElementById("repo-name")).toHaveAttribute("name", "name");
  });

  it("6. cancel button closes the dialog", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => EMPTY_REPOS_RESPONSE })
        .mockResolvedValue({ ok: true, json: async () => MOCK_PROJECTS_RESPONSE })
    );
    const user = userEvent.setup();
    render(<ReposPage />);
    await waitFor(() => screen.getByTestId("connect-repo-btn"));
    await user.click(screen.getByTestId("connect-repo-btn"));
    await waitFor(() => screen.getByRole("dialog"));

    // Act
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // Assert — dialog is gone
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("7. repo card shows GitHub badge for github provider", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => MOCK_REPOS_RESPONSE })
        .mockResolvedValue({ ok: true, json: async () => MOCK_PROJECTS_RESPONSE })
    );

    // Act
    render(<ReposPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("repo-card")).toBeInTheDocument();
    });
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("8. repo card shows GitLab badge for gitlab provider", async () => {
    // Arrange
    const gitlabRepo = { ...MOCK_REPO, provider: "gitlab" };
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => { return { data: [gitlabRepo] }; } })
        .mockResolvedValue({ ok: true, json: async () => MOCK_PROJECTS_RESPONSE })
    );

    // Act
    render(<ReposPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("repo-card")).toBeInTheDocument();
    });
    expect(screen.getByText("GitLab")).toBeInTheDocument();
  });

  it("9. repo card shows default branch when present", async () => {
    // Arrange
    const repoWithBranch = { ...MOCK_REPO, defaultBranch: "develop" };
    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({ ok: true, json: async () => { return { data: [repoWithBranch] }; } })
        .mockResolvedValue({ ok: true, json: async () => MOCK_PROJECTS_RESPONSE })
    );

    // Act
    render(<ReposPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("develop")).toBeInTheDocument();
    });
  });

  it("10. shows error state when fetch rejects", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Server error" }) })
    );

    // Act
    render(<ReposPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Error loading repositories")).toBeInTheDocument();
    });
  });
});
