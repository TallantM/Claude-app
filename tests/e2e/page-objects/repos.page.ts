import type { Page } from "@playwright/test";

/**
 * Page Object for the Repositories page (/repos).
 * Wraps repo cards, connect dialog, and form interactions.
 */
export class ReposPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto("/repos");
    await this.page.waitForSelector(
      '[data-testid="repo-card"], [data-testid="empty-state"], h1',
      { timeout: 10000 }
    );
  }

  async getRepoCardCount(): Promise<number> {
    return this.page.locator('[data-testid="repo-card"]').count();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.page.locator('[data-testid="empty-state"]').isVisible();
  }

  async clickConnectRepo(): Promise<void> {
    await this.page.locator('[data-testid="connect-repo-btn"]').click();
  }

  async connectRepo(name: string, url: string): Promise<void> {
    await this.clickConnectRepo();
    await this.page.waitForSelector('[role="dialog"]', { state: "visible" });
    await this.page.locator("#repo-name").fill(name);
    await this.page.locator("#repo-url").fill(url);
    await this.page.locator('[role="dialog"] button[type="submit"]').click();
    await this.page.waitForSelector('[role="dialog"]', { state: "hidden", timeout: 10000 });
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.page.locator('h1:has-text("Repositories")').isVisible();
  }
}
