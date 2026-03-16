import type { Page } from "@playwright/test";

/**
 * Page Object for the Team page (/team).
 * Wraps member cards, invite dialog, and stat cards.
 */
export class TeamPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto("/team");
    await this.page.waitForSelector(
      '[data-testid="member-card"], [data-testid="empty-state"], h1',
      { timeout: 10000 }
    );
  }

  async getMemberCardCount(): Promise<number> {
    return this.page.locator('[data-testid="member-card"]').count();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.page.locator('[data-testid="empty-state"]').isVisible();
  }

  async clickInviteMember(): Promise<void> {
    await this.page.getByRole("button", { name: /invite member/i }).click();
  }

  async inviteMember(name: string, email: string): Promise<void> {
    await this.clickInviteMember();
    await this.page.waitForSelector('[role="dialog"]', { state: "visible" });
    await this.page.locator("#inv-name").fill(name);
    await this.page.locator("#inv-email").fill(email);
    await this.page.getByRole("button", { name: /send invite/i }).click();
    await this.page.waitForSelector('[role="dialog"]', { state: "hidden", timeout: 10000 });
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.page.locator('h1:has-text("Team Management")').isVisible();
  }
}
