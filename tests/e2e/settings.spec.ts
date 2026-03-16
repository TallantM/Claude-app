import { test, expect } from "@playwright/test";
import { SettingsPage } from "./page-objects/settings.page";

/**
 * Settings E2E tests.
 * Uses saved auth state (via "authenticated" Playwright project).
 */

test.describe("Settings", () => {
  test("should load the settings page with heading and tabs", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.navigate();

    await expect(page).toHaveURL("/settings");
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    await expect(page.getByRole("tab", { name: /profile/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /appearance/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /security/i })).toBeVisible();
  });

  test("should show Profile tab as default with name and email fields", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.navigate();

    // Profile tab is default — these fields should be visible without clicking
    await expect(page.locator('[data-testid="profile-name-input"]')).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#email")).toBeDisabled();
  });

  test("should switch to Appearance tab and show theme picker", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.navigate();
    await settingsPage.clickTab("appearance");

    await expect(page.locator('button:has-text("Light")')).toBeVisible();
    await expect(page.locator('button:has-text("Dark")')).toBeVisible();
    await expect(page.locator('button:has-text("System")')).toBeVisible();
  });

  test("should switch to Security tab and show password fields", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.navigate();
    await settingsPage.clickTab("security");

    await expect(page.locator("#current-password")).toBeVisible();
    await expect(page.locator("#new-password")).toBeVisible();
    await expect(page.locator("#confirm-password")).toBeVisible();
    await expect(page.getByRole("button", { name: /update password/i })).toBeVisible();
  });

  test("should have Save Changes button in Profile tab", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.navigate();

    await expect(page.getByRole("button", { name: /save changes/i })).toBeVisible();
  });

  test("should update active state when selecting a theme", async ({ page }) => {
    const settingsPage = new SettingsPage(page);

    await settingsPage.navigate();
    await settingsPage.clickTab("appearance");

    await page.locator('button:has-text("Dark")').click();

    // Dark button should become selected (has border-primary class)
    const darkBtn = page.locator('button:has-text("Dark")');
    await expect(darkBtn).toBeVisible();
    // The button receives border-primary styling when selected
    const classList = await darkBtn.getAttribute("class");
    expect(classList).toContain("border-primary");
  });
});
