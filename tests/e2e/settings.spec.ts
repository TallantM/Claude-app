import { test, expect } from "@playwright/test";
import { SettingsPage } from "./page-objects/settings.page";

/**
 * Settings E2E tests.
 * Uses saved auth state (via playwright config storageState).
 */

test.describe("Settings", () => {
  test("1. settings page loads with three tabs visible", async ({ page }) => {
    // Arrange
    const settingsPage = new SettingsPage(page);

    // Act — Pattern 12: wait for h1 (no data-testid on this page)
    await settingsPage.navigate();

    // Assert
    await expect(page.locator('h1:has-text("Settings")')).toBeVisible();
    await expect(page.getByRole("tab", { name: /profile/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /appearance/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /security/i })).toBeVisible();
  });

  test("2. Profile tab: name input is present and pre-filled from session", async ({ page }) => {
    // Arrange
    const settingsPage = new SettingsPage(page);
    await settingsPage.navigate();

    // Assert
    await expect(page.locator('[data-testid="profile-name-input"]')).toBeVisible();
    const value = await settingsPage.getProfileNameValue();
    expect(value.length).toBeGreaterThan(0);
  });

  test("3. Appearance tab: theme picker renders Light, Dark, System buttons", async ({ page }) => {
    // Arrange
    const settingsPage = new SettingsPage(page);
    await settingsPage.navigate();

    // Act
    await settingsPage.clickTab("Appearance");

    // Assert
    await expect(page.getByRole("button", { name: /light/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("button", { name: /dark/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /system/i })).toBeVisible();

    // Act — click Dark and assert active styling
    await settingsPage.clickTheme("Dark");
    await expect(page.getByRole("button", { name: /dark/i })).toHaveClass(/border-primary/, {
      timeout: 3000,
    });
  });

  test("4. Security tab: password fields render", async ({ page }) => {
    // Arrange
    const settingsPage = new SettingsPage(page);
    await settingsPage.navigate();

    // Act
    await settingsPage.clickTab("Security");

    // Assert — Pattern 11: exact:true for getByLabel with similar labels
    await expect(
      page.getByLabel("Current Password", { exact: true })
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.getByLabel("New Password", { exact: true })
    ).toBeVisible();
    await expect(
      page.getByLabel("Confirm New Password", { exact: true })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /update password/i })).toBeVisible();
  });
});
