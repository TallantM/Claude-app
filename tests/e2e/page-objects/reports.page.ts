import type { Page } from "@playwright/test";

/**
 * Page Object for the Reports page (/reports).
 * No data-testid attributes, static mock data — wait for h1 (Pattern 12).
 */
export class ReportsPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto("/reports");
    await this.page.waitForSelector("h1", { timeout: 10000 });
  }

  async getChartCardTitles(): Promise<string[]> {
    const titles = await this.page.locator('[class*="CardTitle"], .text-lg').allTextContents();
    return titles;
  }

  async clickExport(index: number): Promise<void> {
    await this.page.locator('button:has-text("Export")').nth(index).click();
  }

  async isChartCardVisible(title: string): Promise<boolean> {
    return this.page.locator(`text="${title}"`).isVisible();
  }
}
