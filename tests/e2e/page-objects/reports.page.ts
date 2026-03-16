import type { Page } from "@playwright/test";

/**
 * Page Object for the Reports page (/reports).
 * Wraps chart card assertions and export button interactions.
 */
export class ReportsPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto("/reports");
    await this.page.waitForSelector("h1", { timeout: 10000 });
  }

  async getExportButtonCount(): Promise<number> {
    return this.page.getByRole("button", { name: /export/i }).count();
  }

  async clickExport(index = 0): Promise<void> {
    await this.page.getByRole("button", { name: /export/i }).nth(index).click();
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.page.locator('h1:has-text("Reports")').isVisible();
  }
}
