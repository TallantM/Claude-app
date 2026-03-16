import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TeamPage from "@/app/(app)/team/page";

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
  usePathname: () => "/team",
}));

const MOCK_TEAM_RESPONSE = {
  data: [
    {
      id: "u1",
      name: "Alice Smith",
      email: "alice@example.com",
      role: "admin",
      image: null,
    },
    {
      id: "u2",
      name: "Bob Jones",
      email: "bob@example.com",
      role: "developer",
      image: null,
    },
  ],
  pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
};

const EMPTY_RESPONSE = {
  data: [],
  pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
};

describe("TeamPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("renders the heading and Invite Member button", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_TEAM_RESPONSE,
      })
    );

    render(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: /Team Management/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /invite member/i })).toBeInTheDocument();
  });

  it("renders member cards after data loads", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_TEAM_RESPONSE,
      })
    );

    render(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });
    expect(screen.getByText("Bob Jones")).toBeInTheDocument();
  });

  it("shows empty state when team has no members", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => EMPTY_RESPONSE,
      })
    );

    render(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
    expect(screen.getByText("No team members yet")).toBeInTheDocument();
  });

  it("shows loading skeleton while data is loading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {}))
    );

    const { container } = render(<TeamPage />);

    // Skeleton elements rendered during load
    expect(container.querySelector(".animate-pulse, [class*='skeleton']")).toBeInTheDocument();
    expect(screen.queryByText("Alice Smith")).not.toBeInTheDocument();
  });

  it("opens invite dialog when Invite Member is clicked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_TEAM_RESPONSE,
      })
    );

    const user = userEvent.setup();
    render(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /invite member/i }));

    await waitFor(() => {
      expect(screen.getByText("Invite Team Member")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Full Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("closes invite dialog when Cancel is clicked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_TEAM_RESPONSE,
      })
    );

    const user = userEvent.setup();
    render(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /invite member/i }));
    await waitFor(() => screen.getByText("Invite Team Member"));

    await user.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText("Invite Team Member")).not.toBeInTheDocument();
    });
  });

  it("Send Invite button is present in the invite dialog", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_TEAM_RESPONSE,
      })
    );

    const user = userEvent.setup();
    render(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /invite member/i }));
    await waitFor(() => screen.getByText("Invite Team Member"));

    expect(screen.getByRole("button", { name: /send invite/i })).toBeInTheDocument();
  });

  it("shows stat cards for Total Members, Admins, Developers", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_TEAM_RESPONSE,
      })
    );

    render(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });

    expect(screen.getByText("Total Members")).toBeInTheDocument();
    expect(screen.getByText("Admins")).toBeInTheDocument();
    expect(screen.getByText("Developers")).toBeInTheDocument();
  });

  it("renders role badge on member card", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_TEAM_RESPONSE,
      })
    );

    render(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    });

    // Admin role badge
    expect(screen.getByText("Admin")).toBeInTheDocument();
    // Developer role badge
    expect(screen.getByText("Developer")).toBeInTheDocument();
  });
});
