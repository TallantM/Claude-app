import type { Page } from "@playwright/test";

/**
 * Page Object for the Repos page (/repos).
 * Wraps repo card and connect repository dialog interactions.
 */
export class ReposPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto("/repos");
    await this.page.waitForSelector(
      '[data-testid="repo-card"], [data-testid="empty-state"]',
      { timeout: 15000 }
    );
  }

  async clickConnectRepoBtn(): Promise<void> {
    await this.page.click('[data-testid="connect-repo-btn"]');
  }

  async fillConnectDialog(name: string, url: string): Promise<void> {
    await this.page.fill("#repo-name", name);
    await this.page.fill("#repo-url", url);
  }

  async submitConnectDialog(): Promise<void> {
    await this.page.click('button[type="submit"]:has-text("Connect Repository")');
  }

  async cancelDialog(): Promise<void> {
    await this.page.click('[role="dialog"] button:has-text("Cancel")');
  }

  async getRepoCardCount(): Promise<number> {
    return this.page.locator('[data-testid="repo-card"]').count();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.page.locator('[data-testid="empty-state"]').isVisible();
  }
}
