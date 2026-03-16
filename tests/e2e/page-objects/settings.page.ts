import type { Page } from "@playwright/test";

/**
 * Page Object for the Settings page (/settings).
 * Wraps tab navigation, profile form, appearance picker, and security form.
 */
export class SettingsPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto("/settings");
    await this.page.waitForSelector("h1", { timeout: 10000 });
  }

  async clickTab(tab: "profile" | "appearance" | "security"): Promise<void> {
    const nameMap = {
      profile: "Profile",
      appearance: "Appearance",
      security: "Security",
    };
    await this.page.getByRole("tab", { name: nameMap[tab] }).click();
    // Wait for the tabpanel to activate
    await this.page.waitForSelector('[role="tabpanel"][data-state="active"]', { timeout: 5000 });
  }

  async updateProfileName(name: string): Promise<void> {
    await this.page.locator('[data-testid="profile-name-input"]').fill(name);
    await this.page.getByRole("button", { name: /save changes/i }).click();
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.page.locator('h1:has-text("Settings")').isVisible();
  }
}
