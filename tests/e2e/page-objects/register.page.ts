import type { Page } from "@playwright/test";

/**
 * Page Object for the Register page (/register).
 * Wraps new user registration form interactions.
 */
export class RegisterPage {
  constructor(private readonly page: Page) {}

  async navigateTo(): Promise<void> {
    await this.page.goto("/register");
  }

  async register(
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<void> {
    await this.page.fill("#name", name);
    await this.page.fill("#email", email);
    await this.page.fill("#password", password);
    await this.page.fill("#confirmPassword", confirmPassword);
    await this.page.click('button[type="submit"]');
  }

  async getErrorMessage(): Promise<string | null> {
    const alert = this.page.locator('[role="alert"]');
    const visible = await alert.isVisible();
    if (!visible) return null;
    return alert.textContent();
  }

  async clickLoginLink(): Promise<void> {
    await this.page.click('a[href="/login"]');
  }

  async isHeadingVisible(): Promise<boolean> {
    return this.page.locator('text=Create an account').isVisible();
  }
}
