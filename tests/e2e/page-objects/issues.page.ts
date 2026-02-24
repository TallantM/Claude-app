import type { Page } from "@playwright/test";

/**
 * Page Object for the Issues page (/issues).
 * Wraps search, status/severity filters, create dialog, and issue row interactions.
 */
export class IssuesPage {
  constructor(private readonly page: Page) {}

  async navigateTo(): Promise<void> {
    await this.page.goto("/issues");
    await this.page.waitForLoadState("networkidle");
  }

  async searchIssues(term: string): Promise<void> {
    const searchInput = this.page.getByPlaceholder("Search issues...");
    await searchInput.fill(term);
  }

  async filterByStatus(
    status: "all" | "open" | "in_progress" | "resolved" | "closed"
  ): Promise<void> {
    // Status is the first combobox
    const trigger = this.page.locator('[role="combobox"]').nth(0);
    await trigger.click();
    const labelMap: Record<string, string> = {
      all: "All Status",
      open: "Open",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Closed",
    };
    await this.page.getByRole("option", { name: labelMap[status] }).click();
    await this.page.waitForLoadState("networkidle");
  }

  async filterBySeverity(
    severity: "all" | "low" | "medium" | "high" | "critical"
  ): Promise<void> {
    // Severity is the second combobox
    const trigger = this.page.locator('[role="combobox"]').nth(1);
    await trigger.click();
    const labelMap: Record<string, string> = {
      all: "All Severity",
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
    };
    await this.page.getByRole("option", { name: labelMap[severity] }).click();
    await this.page.waitForLoadState("networkidle");
  }

  async clickNewIssue(): Promise<void> {
    await this.page.getByRole("button", { name: "New Issue" }).click();
  }

  async createIssue(title: string, description?: string): Promise<void> {
    await this.clickNewIssue();
    await this.page.locator("#issue-title").fill(title);
    if (description) {
      await this.page.locator("#issue-desc").fill(description);
    }
    await this.page.getByRole("button", { name: "Create Issue" }).click();
    await this.page.waitForSelector('[role="dialog"]', { state: "hidden" });
  }

  async getIssueCount(): Promise<number> {
    // Count issue card rows (not the detail dialog)
    return this.page.locator(".space-y-2 > div > [data-radix-collection-item]").count();
  }

  async getIssueTitles(): Promise<string[]> {
    // Issue titles are h4 elements in each card
    const titles = this.page.locator(".space-y-2 h4");
    const count = await titles.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await titles.nth(i).textContent();
      if (text) result.push(text.trim());
    }
    return result;
  }

  async clickIssue(title: string): Promise<void> {
    await this.page.locator(`h4:has-text("${title}")`).first().click();
  }

  async isDetailDialogOpen(): Promise<boolean> {
    return this.page.locator('[role="dialog"]').isVisible();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.page.locator('text=No issues found').isVisible();
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.page.locator('h1:has-text("Issues")').isVisible();
  }
}
