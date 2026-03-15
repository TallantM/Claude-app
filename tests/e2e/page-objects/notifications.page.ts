import type { Page } from "@playwright/test";

/**
 * Page Object for the Notifications page (/notifications).
 * No data-testid attributes — wait for h1 (Pattern 12).
 */
export class NotificationsPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto("/notifications");
    await this.page.waitForSelector("h1", { timeout: 10000 });
  }

  async getNotificationCount(): Promise<number> {
    return this.page.locator('div[role="button"]').count();
  }

  async getUnreadCount(): Promise<number> {
    return this.page.locator(".border-l-4.border-l-primary").count();
  }

  async clickFirstNotification(): Promise<void> {
    await this.page.locator('div[role="button"]').first().click();
  }

  async clickMarkAllAsRead(): Promise<void> {
    await this.page.click('button:has-text("Mark all as read")');
  }

  async isMarkAllReadVisible(): Promise<boolean> {
    return this.page.locator('button:has-text("Mark all as read")').isVisible();
  }

  async getSubtitleText(): Promise<string> {
    return (await this.page.locator("p.text-muted-foreground").first().textContent()) ?? "";
  }
}
