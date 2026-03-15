import { test, expect } from "@playwright/test";
import { ReportsPage } from "./page-objects/reports.page";

/**
 * Reports E2E tests.
 * Uses saved auth state (via playwright config storageState).
 */

test.describe("Reports", () => {
  test("1. reports page loads with all four chart cards", async ({ page }) => {
    // Arrange
    const reportsPage = new ReportsPage(page);

    // Act — Pattern 12: wait for h1
    await reportsPage.navigate();

    // Assert
    await expect(page.locator('h1:has-text("Reports & Analytics")')).toBeVisible();
    await expect(page.locator('text=Sprint Burndown')).toBeVisible();
    await expect(page.locator('text=Team Velocity')).toBeVisible();
    await expect(page.locator('text=Issue Distribution')).toBeVisible();
    await expect(page.locator('text=Task Completion Trend')).toBeVisible();
  });

  test("2. all four Export buttons are present and clickable", async ({ page }) => {
    // Arrange
    const reportsPage = new ReportsPage(page);
    await reportsPage.navigate();

    // Assert — Pattern 4: seed-aware (static page, 4 buttons always present)
    const exportButtons = page.locator('button:has-text("Export")');
    await expect(exportButtons).toHaveCount(4);

    // Act — click first Export button — page should not navigate (dialog/alert only)
    page.once("dialog", (dialog) => dialog.dismiss());
    await reportsPage.clickExport(0);
    await expect(page).toHaveURL(/\/reports/, { timeout: 3000 });
  });

  test("3. reports page is accessible only when authenticated", async ({ browser }) => {
    // Arrange — use fresh browser context (no auth state)
    const freshContext = await browser.newContext({
      storageState: { cookies: [], origins: [] },
    });
    const freshPage = await freshContext.newPage();

    // Act
    await freshPage.goto("/reports");

    // Assert
    await expect(freshPage).toHaveURL(/login/, { timeout: 10000 });
    await freshContext.close();
  });

  test("4. page renders without loading state (static data, no spinner)", async ({ page }) => {
    // Arrange
    const reportsPage = new ReportsPage(page);

    // Act
    await reportsPage.navigate();

    // Assert — no loading skeleton, all chart cards visible immediately
    await expect(page.locator(".animate-pulse")).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Sprint Burndown')).toBeVisible();
    await expect(page.locator('text=Team Velocity')).toBeVisible();
    await expect(page.locator('text=Issue Distribution')).toBeVisible();
    await expect(page.locator('text=Task Completion Trend')).toBeVisible();
  });
});
