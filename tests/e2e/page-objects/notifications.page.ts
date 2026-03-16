import type { Page } from "@playwright/test";

/**
 * Page Object for the Notifications page (/notifications).
 * Wraps notification list interactions, mark as read, and mark all as read.
 */
export class NotificationsPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto("/notifications");
    await this.page.waitForSelector("h1", { timeout: 10000 });
  }

  async getNotificationCount(): Promise<number> {
    return this.page.locator('[role="button"]').count();
  }

  async clickNotification(index = 0): Promise<void> {
    await this.page.locator('[role="button"]').nth(index).click();
  }

  async clickMarkAllAsRead(): Promise<void> {
    await this.page.getByRole("button", { name: /mark all as read/i }).click();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.page.locator("text=No notifications").isVisible();
  }

  async isMarkAllReadButtonVisible(): Promise<boolean> {
    return this.page.getByRole("button", { name: /mark all as read/i }).isVisible();
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.page.locator('h1:has-text("Notifications")').isVisible();
  }
}
