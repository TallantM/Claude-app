import type { Page } from "@playwright/test";

/**
 * Page Object for the Dashboard page (/dashboard).
 * Wraps stat card, activity feed, and task distribution interactions.
 */
export class DashboardPage {
  constructor(private readonly page: Page) {}

  async navigateTo(): Promise<void> {
    await this.page.goto("/dashboard");
    await this.page.waitForLoadState("networkidle");
  }

  async isLoaded(): Promise<boolean> {
    return this.page.locator('h1:has-text("Dashboard")').isVisible();
  }

  async getStatValue(label: string): Promise<string> {
    // Find the card that contains the given label, then get the numeric value in it
    const card = this.page.locator(`.card, [class*="card"]`).filter({ hasText: label }).first();
    const valueEl = card.locator('.text-2xl, [class*="text-2xl"]').first();
    return (await valueEl.textContent()) ?? "";
  }

  async isActivityFeedVisible(): Promise<boolean> {
    return this.page.locator('text=Recent Activity').isVisible();
  }

  async getActivityItemCount(): Promise<number> {
    // Activity items are rows in the Recent Activity card's content
    const activityCard = this.page.locator('[class*="card"]').filter({ hasText: "Recent Activity" });
    const items = activityCard.locator(".flex.items-start");
    return items.count();
  }

  async isTaskDistributionVisible(): Promise<boolean> {
    return this.page.locator('text=Task Distribution').isVisible();
  }

  async isLoadingSkeletonVisible(): Promise<boolean> {
    return this.page.locator('.animate-pulse').first().isVisible();
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.page.locator('h1:has-text("Dashboard")').isVisible();
  }
}
