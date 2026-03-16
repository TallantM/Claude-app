import type { Page } from "@playwright/test";

/**
 * Page Object for the Pipelines page (/pipelines).
 * Wraps pipeline card interactions, trigger run, and details expand/collapse.
 */
export class PipelinesPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto("/pipelines");
    await this.page.waitForSelector(
      '[data-testid="pipeline-card"], [data-testid="empty-state"], h1',
      { timeout: 10000 }
    );
  }

  async getPipelineCardCount(): Promise<number> {
    return this.page.locator('[data-testid="pipeline-card"]').count();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.page.locator('[data-testid="empty-state"]').isVisible();
  }

  async triggerRun(index = 0): Promise<void> {
    const card = this.page.locator('[data-testid="pipeline-card"]').nth(index);
    await card.getByRole("button", { name: /trigger run/i }).click();
  }

  async toggleDetails(index = 0): Promise<void> {
    const card = this.page.locator('[data-testid="pipeline-card"]').nth(index);
    await card.getByRole("button", { name: /details/i }).click();
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.page.locator('h1:has-text("CI/CD Pipelines")').isVisible();
  }
}
