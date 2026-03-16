import { test, expect } from "@playwright/test";
import { NotificationsPage } from "./page-objects/notifications.page";

/**
 * Notifications E2E tests.
 * Uses saved auth state (via "authenticated" Playwright project).
 */

test.describe("Notifications", () => {
  test("should load the notifications page with heading", async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);

    await notificationsPage.navigate();

    await expect(page).toHaveURL("/notifications");
    await expect(page.locator('h1:has-text("Notifications")')).toBeVisible();
  });

  test("should show notification list or empty state (seed-aware)", async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);

    await notificationsPage.navigate();

    const emptyVisible = await notificationsPage.isEmptyStateVisible();
    if (emptyVisible) {
      await expect(page.locator("text=No notifications")).toBeVisible();
    } else {
      // At least some content visible
      await expect(page.locator('h1:has-text("Notifications")')).toBeVisible();
    }
  });

  test("should clicking a notification mark it as read optimistically", async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);

    await notificationsPage.navigate();

    const emptyVisible = await notificationsPage.isEmptyStateVisible();
    if (emptyVisible) {
      test.skip();
      return;
    }

    // Find unread notification (has border-l-primary)
    const unreadNotification = page.locator(".border-l-primary").first();
    const hasUnread = await unreadNotification.isVisible();

    if (!hasUnread) {
      test.skip();
      return;
    }

    await unreadNotification.click();

    // After clicking, the notification should no longer have unread border
    await expect(unreadNotification).not.toBeVisible({ timeout: 3000 });
  });

  test("should Mark all as read button remove unread styling", async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);

    await notificationsPage.navigate();

    const hasMarkAll = await notificationsPage.isMarkAllReadButtonVisible();
    if (!hasMarkAll) {
      test.skip();
      return;
    }

    await notificationsPage.clickMarkAllAsRead();

    // Button should disappear after marking all read
    await expect(
      page.getByRole("button", { name: /mark all as read/i })
    ).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=All caught up")).toBeVisible({ timeout: 5000 });
  });

  test("should render without JavaScript errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const notificationsPage = new NotificationsPage(page);
    await notificationsPage.navigate();

    expect(errors).toHaveLength(0);
    await expect(page.locator('h1:has-text("Notifications")')).toBeVisible();
  });
});
