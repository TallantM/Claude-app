// Tests for Zustand stores — verifies state transitions and derived values (e.g. unread count).

import { describe, it, expect, beforeEach } from "vitest";
import { useSidebarStore, useNotificationStore, useProjectFilterStore } from "@/store";
import type { NotificationType } from "@/types";

// ─── Sidebar ───

describe("useSidebarStore", () => {
  beforeEach(() => {
    useSidebarStore.setState({ isOpen: true });
  });

  it("starts with sidebar open", () => {
    expect(useSidebarStore.getState().isOpen).toBe(true);
  });

  it("toggles sidebar", () => {
    useSidebarStore.getState().toggle();
    expect(useSidebarStore.getState().isOpen).toBe(false);
    useSidebarStore.getState().toggle();
    expect(useSidebarStore.getState().isOpen).toBe(true);
  });

  it("closes sidebar", () => {
    useSidebarStore.getState().close();
    expect(useSidebarStore.getState().isOpen).toBe(false);
  });

  it("opens sidebar", () => {
    useSidebarStore.getState().close();
    useSidebarStore.getState().open();
    expect(useSidebarStore.getState().isOpen).toBe(true);
  });
});

// ─── Notifications ───

describe("useNotificationStore", () => {
  const mockNotifications: NotificationType[] = [
    { id: "1", type: "task_assigned", title: "Test 1", message: "Msg 1", read: false, link: null, createdAt: "2025-01-01" },
    { id: "2", type: "comment_added", title: "Test 2", message: "Msg 2", read: true, link: null, createdAt: "2025-01-01" },
    { id: "3", type: "sprint_started", title: "Test 3", message: "Msg 3", read: false, link: null, createdAt: "2025-01-01" },
  ];

  beforeEach(() => {
    useNotificationStore.setState({ notifications: [], unreadCount: 0 });
  });

  it("sets notifications and counts unread", () => {
    useNotificationStore.getState().setNotifications(mockNotifications);
    expect(useNotificationStore.getState().notifications).toHaveLength(3);
    expect(useNotificationStore.getState().unreadCount).toBe(2);
  });

  it("marks single notification as read", () => {
    useNotificationStore.getState().setNotifications(mockNotifications);
    useNotificationStore.getState().markAsRead("1");
    expect(useNotificationStore.getState().unreadCount).toBe(1);
    expect(useNotificationStore.getState().notifications[0].read).toBe(true);
  });

  it("marks all as read", () => {
    useNotificationStore.getState().setNotifications(mockNotifications);
    useNotificationStore.getState().markAllAsRead();
    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });

  it("adds notification", () => {
    useNotificationStore.getState().addNotification({
      id: "new",
      type: "test",
      title: "New",
      message: "New notification",
      read: false,
      link: null,
      createdAt: "2025-01-02",
    });
    expect(useNotificationStore.getState().notifications).toHaveLength(1);
    expect(useNotificationStore.getState().unreadCount).toBe(1);
  });
});

// ─── Project Filters ───

describe("useProjectFilterStore", () => {
  beforeEach(() => {
    useProjectFilterStore.setState({ search: "", status: "all" });
  });

  it("sets search", () => {
    useProjectFilterStore.getState().setSearch("test");
    expect(useProjectFilterStore.getState().search).toBe("test");
  });

  it("sets status", () => {
    useProjectFilterStore.getState().setStatus("active");
    expect(useProjectFilterStore.getState().status).toBe("active");
  });

  it("resets filters", () => {
    useProjectFilterStore.getState().setSearch("test");
    useProjectFilterStore.getState().setStatus("active");
    useProjectFilterStore.getState().reset();
    expect(useProjectFilterStore.getState().search).toBe("");
    expect(useProjectFilterStore.getState().status).toBe("all");
  });
});
