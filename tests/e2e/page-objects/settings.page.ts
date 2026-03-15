import type { Page } from "@playwright/test";

/**
 * Page Object for the Settings page (/settings).
 * No data-testid attributes on this page — wait for h1 (Pattern 12).
 */
export class SettingsPage {
  constructor(private readonly page: Page) {}

  async navigate(): Promise<void> {
    await this.page.goto("/settings");
    await this.page.waitForSelector("h1", { timeout: 10000 });
  }

  async clickTab(name: "Profile" | "Appearance" | "Security"): Promise<void> {
    await this.page.getByRole("tab", { name }).click();
  }

  async getProfileNameValue(): Promise<string> {
    return (await this.page.inputValue('[data-testid="profile-name-input"]')) ?? "";
  }

  async setProfileName(name: string): Promise<void> {
    await this.page.fill('[data-testid="profile-name-input"]', name);
  }

  async clickSaveChanges(): Promise<void> {
    await this.page.click('button:has-text("Save Changes")');
  }

  async clickTheme(theme: "Light" | "Dark" | "System"): Promise<void> {
    await this.page.click(`button:has-text("${theme}")`);
  }
}
