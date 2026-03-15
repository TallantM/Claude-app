import { test, expect } from "@playwright/test";
import { NotificationsPage } from "./page-objects/notifications.page";

/**
 * Notifications E2E tests.
 * Uses saved auth state (via playwright config storageState).
 */

test.describe("Notifications", () => {
  test("1. notifications page loads and shows notification items or empty state", async ({ page }) => {
    // Arrange
    const notificationsPage = new NotificationsPage(page);

    // Act — Pattern 12: wait for h1
    await notificationsPage.navigate();

    // Assert
    await expect(page.locator('h1:has-text("Notifications")')).toBeVisible();
    // Either notification items or "No notifications" empty state
    const hasItems = (await page.locator('div[role="button"]').count()) > 0;
    const hasEmpty = (await page.locator('text=No notifications').count()) > 0;
    expect(hasItems || hasEmpty).toBe(true);
  });

  test("2. mark single notification as read by clicking it", async ({ page }) => {
    // Arrange
    const notificationsPage = new NotificationsPage(page);
    await notificationsPage.navigate();

    // Check for unread notifications
    const unreadItems = page.locator(".border-l-4.border-l-primary");
    const unreadCount = await unreadItems.count();
    if (unreadCount === 0) {
      test.skip();
      return;
    }

    // Act — click the first unread notification
    const firstUnread = unreadItems.first();
    await firstUnread.click();

    // Assert — unread styling removed after click (optimistic update)
    await expect(firstUnread).not.toHaveClass(/border-l-primary/, { timeout: 5000 });
  });

  test("3. \"Mark all as read\" button marks all notifications as read", async ({ page }) => {
    // Arrange
    const notificationsPage = new NotificationsPage(page);
    await notificationsPage.navigate();

    // Only proceed if button exists
    const markAllBtn = page.locator('button:has-text("Mark all as read")');
    if (!(await markAllBtn.isVisible())) {
      test.skip();
      return;
    }

    // Act
    await markAllBtn.click();

    // Assert
    await expect(markAllBtn).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=All caught up')).toBeVisible({ timeout: 5000 });
  });

  test("4. empty state renders when no notifications exist (conditional skip if DB seeded)", async ({ page }) => {
    // Arrange
    await page.goto("/notifications");
    await page.waitForSelector("h1", { timeout: 10000 });

    // Pattern 3: conditional skip if items exist
    const itemCount = await page.locator('div[role="button"]').count();
    if (itemCount > 0) {
      test.skip();
      return;
    }

    // Assert
    await expect(page.locator('text=No notifications')).toBeVisible();
  });
});
