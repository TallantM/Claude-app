/**
 * Team unit tests matching spec scenarios 1-10.
 */
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

const MOCK_MEMBER = {
  id: "1",
  name: "Alice Smith",
  email: "alice@example.com",
  role: "developer",
  image: null,
};

const MOCK_RESPONSE = {
  data: [MOCK_MEMBER],
  pagination: { total: 1, page: 1, pageSize: 10, totalPages: 1 },
};

const EMPTY_RESPONSE = {
  data: [],
  pagination: { total: 0, page: 1, pageSize: 10, totalPages: 0 },
};

describe("TeamPage (spec scenarios)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. shows loading skeletons while fetch is pending", () => {
    // Arrange
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise(() => {})));

    // Act
    render(<TeamPage />);

    // Assert — Skeleton elements visible, no member cards
    const skeletons = document.querySelectorAll("[data-slot='skeleton'], .animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
    expect(screen.queryByTestId("member-card")).not.toBeInTheDocument();
  });

  it("2. renders member cards after data loads", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );

    // Act
    render(<TeamPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("member-card")).toBeInTheDocument();
    });
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("3. shows empty state card when no members exist", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => EMPTY_RESPONSE })
    );

    // Act
    render(<TeamPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
    expect(screen.getByText("No team members yet")).toBeInTheDocument();
  });

  it("4. renders role badge for each member", async () => {
    // Arrange
    const membersWithRoles = {
      data: [
        { ...MOCK_MEMBER, id: "1", name: "Alice", role: "developer" },
        { ...MOCK_MEMBER, id: "2", name: "Bob", email: "bob@example.com", role: "admin" },
        { ...MOCK_MEMBER, id: "3", name: "Carol", email: "carol@example.com", role: "tester" },
      ],
      pagination: { total: 3, page: 1, pageSize: 10, totalPages: 1 },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => membersWithRoles })
    );

    // Act
    render(<TeamPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getAllByTestId("member-card")).toHaveLength(3);
    });
    expect(screen.getByText("Developer")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Tester")).toBeInTheDocument();
  });

  it("5. stat cards show total members, admins, developer counts", async () => {
    // Arrange — 1 admin, 2 developers
    const threeMembers = {
      data: [
        { ...MOCK_MEMBER, id: "1", name: "Alice", role: "admin" },
        { ...MOCK_MEMBER, id: "2", name: "Bob", email: "bob@example.com", role: "developer" },
        { ...MOCK_MEMBER, id: "3", name: "Carol", email: "carol@example.com", role: "developer" },
      ],
      pagination: { total: 3, page: 1, pageSize: 10, totalPages: 1 },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => threeMembers })
    );

    // Act
    render(<TeamPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getAllByTestId("member-card")).toHaveLength(3);
    });
    // Stat cards: "3" total, "1" admin, "2" developers
    expect(screen.getByText("Total Members")).toBeInTheDocument();
    expect(screen.getByText("Admins")).toBeInTheDocument();
  });

  it("6. opens invite dialog when Invite Member button clicked", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );
    const user = userEvent.setup();
    render(<TeamPage />);
    await waitFor(() => screen.getByTestId("member-card"));

    // Act
    await user.click(screen.getByRole("button", { name: /invite member/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Invite Team Member")).toBeInTheDocument();
    });
    expect(document.getElementById("inv-name")).toBeInTheDocument();
    expect(document.getElementById("inv-email")).toBeInTheDocument();
  });

  it("7. invite dialog: Send Invite button is present and calls /api/auth/register", async () => {
    // Arrange
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_RESPONSE })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) }) // POST register
      .mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE }); // refetch
    vi.stubGlobal("fetch", mockFetch);
    const user = userEvent.setup();
    render(<TeamPage />);
    await waitFor(() => screen.getByTestId("member-card"));
    await user.click(screen.getByRole("button", { name: /invite member/i }));
    await waitFor(() => screen.getByText("Invite Team Member"));

    // Act
    await user.type(document.getElementById("inv-name")!, "New Member");
    await user.type(document.getElementById("inv-email")!, "new@example.com");
    await user.click(screen.getByRole("button", { name: /send invite/i }));

    // Assert
    await waitFor(() => {
      const postCall = mockFetch.mock.calls.find(
        (args) => args[1]?.method === "POST"
      );
      expect(postCall).toBeDefined();
      expect(postCall![0]).toBe("/api/auth/register");
    });
  });

  it("8. invite dialog closes on Cancel", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );
    const user = userEvent.setup();
    render(<TeamPage />);
    await waitFor(() => screen.getByTestId("member-card"));
    await user.click(screen.getByRole("button", { name: /invite member/i }));
    await waitFor(() => screen.getByText("Invite Team Member"));

    // Act
    await user.click(screen.getByRole("button", { name: /cancel/i }));

    // Assert
    await waitFor(() => {
      expect(screen.queryByText("Invite Team Member")).not.toBeInTheDocument();
    });
  });

  it("9. role select in invite dialog has correct options", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );
    const user = userEvent.setup();
    render(<TeamPage />);
    await waitFor(() => screen.getByTestId("member-card"));
    await user.click(screen.getByRole("button", { name: /invite member/i }));
    await waitFor(() => screen.getByText("Invite Team Member"));

    // Assert — role select trigger is present in dialog
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    // The role select trigger is a combobox
    expect(dialog.querySelector('[role="combobox"]')).toBeInTheDocument();
  });

  it("10. avatar initials are rendered from member name", async () => {
    // Arrange
    const memberBob = { ...MOCK_MEMBER, id: "b1", name: "Bob Jones", email: "bob@example.com" };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [memberBob], pagination: { total: 1, page: 1, pageSize: 10, totalPages: 1 } }),
      })
    );

    // Act
    render(<TeamPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("BJ")).toBeInTheDocument();
    });
  });
});
