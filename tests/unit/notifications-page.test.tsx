import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NotificationsPage from "@/app/(app)/notifications/page";

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
  usePathname: () => "/notifications",
}));

const MOCK_NOTIFICATIONS_RESPONSE = {
  data: [
    {
      id: "n1",
      type: "task_assigned",
      title: "Task assigned to you",
      message: "You have been assigned Fix login bug",
      read: false,
      link: "/projects/p1",
      createdAt: "2026-01-01T00:00:00Z",
    },
    {
      id: "n2",
      type: "comment_added",
      title: "New comment",
      message: "Alice commented on your task",
      read: true,
      link: null,
      createdAt: "2026-01-02T00:00:00Z",
    },
  ],
  pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
};

const ALL_READ_RESPONSE = {
  data: [
    {
      id: "n1",
      type: "task_assigned",
      title: "Task assigned to you",
      message: "You have been assigned Fix login bug",
      read: true,
      link: null,
      createdAt: "2026-01-01T00:00:00Z",
    },
  ],
  pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
};

const EMPTY_RESPONSE = {
  data: [],
  pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
};

describe("NotificationsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("renders page heading and notification items", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_NOTIFICATIONS_RESPONSE,
      })
    );

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Task assigned to you")).toBeInTheDocument();
    });
    expect(screen.getByRole("heading", { name: /notifications/i })).toBeInTheDocument();
    expect(screen.getByText("New comment")).toBeInTheDocument();
  });

  it("shows empty state when no notifications exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => EMPTY_RESPONSE,
      })
    );

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("No notifications")).toBeInTheDocument();
    });
  });

  it("shows loading skeleton while data is loading", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() => new Promise(() => {}))
    );

    const { container } = render(<NotificationsPage />);

    expect(container.querySelector(".animate-pulse, [class*='skeleton']")).toBeInTheDocument();
    expect(screen.queryByText("Task assigned to you")).not.toBeInTheDocument();
  });

  it("shows unread count in subtitle when unread notifications exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_NOTIFICATIONS_RESPONSE,
      })
    );

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("1 unread")).toBeInTheDocument();
    });
  });

  it("shows all caught up when no unread notifications", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ALL_READ_RESPONSE,
      })
    );

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("All caught up")).toBeInTheDocument();
    });
  });

  it("shows Mark all as read button when unread notifications exist", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_NOTIFICATIONS_RESPONSE,
      })
    );

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /mark all as read/i })).toBeInTheDocument();
    });
  });

  it("hides Mark all as read button when all notifications are read", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ALL_READ_RESPONSE,
      })
    );

    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Task assigned to you")).toBeInTheDocument();
    });

    expect(screen.queryByRole("button", { name: /mark all as read/i })).not.toBeInTheDocument();
  });

  it("clicking a notification calls PATCH /api/notifications with the notification id", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_NOTIFICATIONS_RESPONSE,
    });
    vi.stubGlobal("fetch", mockFetch);

    const user = userEvent.setup();
    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByText("Task assigned to you")).toBeInTheDocument();
    });

    // Click the unread notification (n1)
    await user.click(screen.getByText("Task assigned to you").closest('[role="button"]')!);

    await waitFor(() => {
      const patchCall = mockFetch.mock.calls.find(
        (args) => args[1]?.method === "PATCH"
      );
      expect(patchCall).toBeDefined();
      const body = JSON.parse(patchCall![1].body);
      expect(body.ids).toContain("n1");
    });
  });

  it("clicking Mark all as read calls PATCH with { all: true }", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => MOCK_NOTIFICATIONS_RESPONSE,
    });
    vi.stubGlobal("fetch", mockFetch);

    const user = userEvent.setup();
    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /mark all as read/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /mark all as read/i }));

    await waitFor(() => {
      const patchCall = mockFetch.mock.calls.find(
        (args) => args[1]?.method === "PATCH"
      );
      expect(patchCall).toBeDefined();
      const body = JSON.parse(patchCall![1].body);
      expect(body.all).toBe(true);
    });
  });

  it("optimistically updates to all caught up after Mark all as read", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_NOTIFICATIONS_RESPONSE,
      })
    );

    const user = userEvent.setup();
    render(<NotificationsPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /mark all as read/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /mark all as read/i }));

    await waitFor(() => {
      expect(screen.getByText("All caught up")).toBeInTheDocument();
    });
  });
});
