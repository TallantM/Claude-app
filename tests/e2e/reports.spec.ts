import { test, expect } from "@playwright/test";
import { ReportsPage } from "./page-objects/reports.page";

/**
 * Reports E2E tests.
 * Uses saved auth state (via "authenticated" Playwright project).
 * Note: Chart.js renders canvas elements — we only assert page structure,
 * not chart internals.
 */

test.describe("Reports", () => {
  test("should load the reports page with heading", async ({ page }) => {
    const reportsPage = new ReportsPage(page);

    await reportsPage.navigate();

    await expect(page).toHaveURL("/reports");
    await expect(page.locator('h1:has-text("Reports & Analytics")')).toBeVisible();
  });

  test("should show all four chart card titles", async ({ page }) => {
    const reportsPage = new ReportsPage(page);

    await reportsPage.navigate();

    await expect(page.locator('text=Sprint Burndown')).toBeVisible();
    await expect(page.locator('text=Team Velocity')).toBeVisible();
    await expect(page.locator('text=Issue Distribution')).toBeVisible();
    await expect(page.locator('text=Task Completion Trend')).toBeVisible();
  });

  test("should show four Export buttons", async ({ page }) => {
    const reportsPage = new ReportsPage(page);

    await reportsPage.navigate();

    const count = await reportsPage.getExportButtonCount();
    expect(count).toBe(4);
  });

  test("should have clickable Export button without navigation", async ({ page }) => {
    const reportsPage = new ReportsPage(page);

    await reportsPage.navigate();

    // Handle dialog that appears from alert()
    page.on("dialog", async (dialog) => {
      await dialog.dismiss();
    });

    await reportsPage.clickExport(0);

    // Page should remain on /reports
    await expect(page).toHaveURL("/reports");
    await expect(page.locator('h1:has-text("Reports & Analytics")')).toBeVisible();
  });
});
