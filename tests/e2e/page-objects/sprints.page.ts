import type { Page } from "@playwright/test";

/**
 * Page Object for accessing the Sprints tab within a project detail page.
 * There is no dedicated /sprints route. Sprints live under /projects/[id].
 */
export class SprintsPage {
  constructor(private readonly page: Page) {}

  /**
   * Navigates to /projects, clicks the first project card, then activates the Sprints tab.
   */
  async navigate(): Promise<void> {
    await this.page.goto("/projects");
    // Wait for at least one project card or the empty state
    await this.page.waitForSelector(
      '[data-testid="project-card"], h1:has-text("Projects")',
      { timeout: 10000 }
    );
    // Click the first project card
    const cards = this.page.locator('[data-testid="project-card"]');
    await cards.first().click();
    // Wait for project detail heading
    await this.page.waitForSelector("h1", { timeout: 10000 });
  }

  async clickSprintsTab(): Promise<void> {
    await this.page.getByRole("tab", { name: /sprints/i }).click();
    await this.page.waitForSelector('[role="tabpanel"][data-state="active"]', { timeout: 5000 });
  }

  async clickBoardTab(): Promise<void> {
    await this.page.getByRole("tab", { name: /board/i }).click();
    await this.page.waitForSelector('[role="tabpanel"][data-state="active"]', { timeout: 5000 });
  }

  async isSprintsEmptyStateVisible(): Promise<boolean> {
    return this.page.locator("text=No sprints yet").isVisible();
  }

  async getSprintCount(): Promise<number> {
    const tabpanel = this.page.locator('[role="tabpanel"][data-state="active"]');
    return tabpanel.locator(".space-y-4 > div").count();
  }
}
