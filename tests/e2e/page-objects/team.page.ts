import type { Page } from "@playwright/test";

/**
 * Page Object for the Team page (/team).
 * Wraps member card and invite dialog interactions.
 */
export class TeamPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto("/team");
    await this.page.waitForSelector(
      '[data-testid="member-card"], [data-testid="empty-state"]',
      { timeout: 15000 }
    );
  }

  async clickInviteMember(): Promise<void> {
    await this.page.click('button:has-text("Invite Member")');
  }

  async fillInviteDialog(name: string, email: string, _role?: string): Promise<void> {
    await this.page.fill("#inv-name", name);
    await this.page.fill("#inv-email", email);
  }

  async submitInviteDialog(): Promise<void> {
    await this.page.click('button:has-text("Send Invite")');
  }

  async cancelDialog(): Promise<void> {
    await this.page.click('[role="dialog"] button:has-text("Cancel")');
  }

  async getMemberCardCount(): Promise<number> {
    return this.page.locator('[data-testid="member-card"]').count();
  }

  async isEmptyStateVisible(): Promise<boolean> {
    return this.page.locator('[data-testid="empty-state"]').isVisible();
  }
}
