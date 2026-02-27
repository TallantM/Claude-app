import type { Page } from "@playwright/test";

/**
 * Page Object for the Login page (/login).
 * Wraps email/password login form and OAuth button interactions.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  async navigateTo(): Promise<void> {
    await this.page.goto("/login");
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.fill("#email", email);
    await this.page.fill("#password", password);
    await this.page.click('button[type="submit"]');
  }

  async getErrorMessage(): Promise<string | null> {
    const alert = this.page.locator('.text-destructive[role="alert"]');
    const visible = await alert.isVisible();
    if (!visible) return null;
    return alert.textContent();
  }

  async isErrorVisible(): Promise<boolean> {
    return this.page.locator('.text-destructive[role="alert"]').isVisible();
  }

  async clickRegisterLink(): Promise<void> {
    await this.page.click('a[href="/register"]');
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.page.locator('text=Welcome back').isVisible();
  }
}
