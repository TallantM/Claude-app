/**
 * Notifications unit tests matching spec scenarios 1-10.
 */
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

const MOCK_NOTIFICATION_UNREAD = {
  id: "1",
  type: "task_assigned",
  title: "Task assigned",
  message: "You have a new task",
  read: false,
  link: null,
  createdAt: "2026-01-01T00:00:00Z",
};

const MOCK_NOTIFICATION_READ = {
  id: "2",
  type: "comment_added",
  title: "Comment added",
  message: "Someone commented",
  read: true,
  link: null,
  createdAt: "2026-01-02T00:00:00Z",
};

const MOCK_RESPONSE = {
  data: [MOCK_NOTIFICATION_UNREAD],
  pagination: { total: 1, page: 1, pageSize: 20, totalPages: 1 },
};

const EMPTY_RESPONSE = {
  data: [],
  pagination: { total: 0, page: 1, pageSize: 20, totalPages: 0 },
};

describe("NotificationsPage (spec scenarios)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("1. shows loading skeletons while fetch is pending", () => {
    // Arrange
    vi.stubGlobal("fetch", vi.fn().mockImplementation(() => new Promise(() => {})));

    // Act
    render(<NotificationsPage />);

    // Assert — Skeleton elements visible
    const skeletons = document.querySelectorAll("[data-slot='skeleton'], .h-20");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("2. renders notification items after data loads", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );

    // Act
    render(<NotificationsPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });
    expect(screen.getByText("Task assigned")).toBeInTheDocument();
  });

  it("3. shows \"No notifications\" empty state when list is empty", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => EMPTY_RESPONSE })
    );

    // Act
    render(<NotificationsPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("No notifications")).toBeInTheDocument();
    });
  });

  it("4. unread count is shown in subtitle when unread notifications exist", async () => {
    // Arrange — 2 unread, 1 read
    const twoUnread = {
      data: [
        MOCK_NOTIFICATION_UNREAD,
        { ...MOCK_NOTIFICATION_UNREAD, id: "3", title: "Sprint started" },
        MOCK_NOTIFICATION_READ,
      ],
      pagination: { total: 3, page: 1, pageSize: 20, totalPages: 1 },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => twoUnread })
    );

    // Act
    render(<NotificationsPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("2 unread")).toBeInTheDocument();
    });
  });

  it("5. shows \"All caught up\" subtitle when all notifications are read", async () => {
    // Arrange
    const allRead = {
      data: [MOCK_NOTIFICATION_READ],
      pagination: { total: 1, page: 1, pageSize: 20, totalPages: 1 },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => allRead })
    );

    // Act
    render(<NotificationsPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("All caught up")).toBeInTheDocument();
    });
  });

  it("6. Mark all as read button is visible when unread notifications exist", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );

    // Act
    render(<NotificationsPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /mark all as read/i })).toBeInTheDocument();
    });
  });

  it("7. Mark all as read button is NOT visible when all notifications are read", async () => {
    // Arrange
    const allRead = {
      data: [MOCK_NOTIFICATION_READ],
      pagination: { total: 1, page: 1, pageSize: 20, totalPages: 1 },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => allRead })
    );

    // Act
    render(<NotificationsPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("All caught up")).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: /mark all as read/i })).not.toBeInTheDocument();
  });

  it("8. clicking an unread notification calls PATCH /api/notifications", async () => {
    // Arrange
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_RESPONSE })
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", mockFetch);
    const user = userEvent.setup();
    render(<NotificationsPage />);
    await waitFor(() => screen.getByText("Task assigned"));

    // Act — click the notification item
    const notificationItem = screen.getByRole("button", { name: /task assigned/i });
    await user.click(notificationItem);

    // Assert
    await waitFor(() => {
      const patchCall = mockFetch.mock.calls.find(
        (args) => args[1]?.method === "PATCH"
      );
      expect(patchCall).toBeDefined();
      expect(patchCall![0]).toBe("/api/notifications");
      const body = JSON.parse(patchCall![1].body);
      expect(body.ids).toContain("1");
    });
  });

  it("9. clicking \"Mark all as read\" calls PATCH /api/notifications with all:true", async () => {
    // Arrange
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => MOCK_RESPONSE })
      .mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal("fetch", mockFetch);
    const user = userEvent.setup();
    render(<NotificationsPage />);
    await waitFor(() => screen.getByRole("button", { name: /mark all as read/i }));

    // Act
    await user.click(screen.getByRole("button", { name: /mark all as read/i }));

    // Assert
    await waitFor(() => {
      const patchCall = mockFetch.mock.calls.find(
        (args) => args[1]?.method === "PATCH"
      );
      expect(patchCall).toBeDefined();
      const body = JSON.parse(patchCall![1].body);
      expect(body.all).toBe(true);
    });
  });

  it("10. unread notification renders with bold title and primary left border", async () => {
    // Arrange
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => MOCK_RESPONSE })
    );

    // Act
    const { container } = render(<NotificationsPage />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText("Task assigned")).toBeInTheDocument();
    });
    // Unread notification has font-semibold on title
    const titleEl = screen.getByText("Task assigned");
    expect(titleEl).toHaveClass("font-semibold");
    // Container has border-l-primary class indicating unread
    expect(container.querySelector(".border-l-primary")).toBeInTheDocument();
  });
});
