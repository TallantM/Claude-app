import type { Page } from "@playwright/test";

/**
 * Page Object for the Pipelines page (/pipelines).
 * Wraps pipeline card, trigger run, and details toggle interactions.
 */
export class PipelinesPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto("/pipelines");
    await this.page.waitForSelector(
      '[data-testid="pipeline-card"], [data-testid="empty-state"]',
      { timeout: 15000 }
    );
  }

  async getPipelineCardCount(): Promise<number> {
    return this.page.locator('[data-testid="pipeline-card"]').count();
  }

  async clickTriggerRun(index = 0): Promise<void> {
    await this.page
      .locator('[data-testid="pipeline-card"]')
      .nth(index)
      .getByRole("button", { name: /trigger run/i })
      .click();
  }

  async clickDetails(index = 0): Promise<void> {
    await this.page
      .locator('[data-testid="pipeline-card"]')
      .nth(index)
      .getByRole("button", { name: /details/i })
      .click();
  }

  async isExpandedVisible(index = 0): Promise<boolean> {
    const card = this.page.locator('[data-testid="pipeline-card"]').nth(index);
    const stages = card.locator('h4:has-text("Stages")');
    const runs = card.locator('h4:has-text("Recent Runs")');
    return (await stages.isVisible()) || (await runs.isVisible());
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.page.locator('[data-testid="empty-state"]').isVisible();
  }
}
