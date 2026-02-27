import { test, expect } from "@playwright/test";
import { DashboardPage } from "./page-objects/dashboard.page";

/**
 * Dashboard E2E tests.
 * Uses saved auth state (via "authenticated" Playwright project).
 * Requires a seeded database with entities (projects, tasks, issues, etc.).
 */

test.describe("Dashboard", () => {
  test("should load the dashboard with heading and stat cards", async ({ page }) => {
    // Arrange
    const dashboardPage = new DashboardPage(page);

    // Act
    await dashboardPage.navigateTo();

    // Assert
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('p:has-text("Overview of your SDLC workspace")')).toBeVisible();
  });

  test("should display all six stat cards", async ({ page }) => {
    // Arrange
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateTo();

    // Assert — all stat card labels are visible
    await expect(page.locator("text=Total Projects")).toBeVisible();
    await expect(page.locator("text=Total Tasks")).toBeVisible();
    await expect(page.locator("text=Completed Tasks")).toBeVisible();
    await expect(page.locator("text=Open Issues")).toBeVisible();
    await expect(page.locator("text=Active Sprints")).toBeVisible();
    await expect(page.locator("text=Team Members")).toBeVisible();
  });

  test("should display Recent Activity section", async ({ page }) => {
    // Arrange
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateTo();

    // Assert
    await expect(page.locator('text=Recent Activity')).toBeVisible();
  });

  test("should display Task Distribution section with status labels", async ({ page }) => {
    // Arrange
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateTo();

    // Assert
    await expect(page.locator('text=Task Distribution')).toBeVisible();
    await expect(page.locator('text=To Do')).toBeVisible();
    await expect(page.locator('text=In Progress')).toBeVisible();
    await expect(page.locator('text=Done')).toBeVisible();
    await expect(page.locator('text=Total Tasks')).toBeVisible();
  });

  test("should show stat card numeric values after data loads", async ({ page }) => {
    // Arrange
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateTo();

    // Assert — loading skeleton should be gone and values should be visible
    await expect(page.locator(".animate-pulse")).not.toBeVisible({ timeout: 10000 });
    // Each stat card should have a number (even if 0)
    const statNumbers = page.locator(".text-2xl.font-bold");
    const count = await statNumbers.count();
    expect(count).toBeGreaterThanOrEqual(6);
  });

  test("should navigate to dashboard from sidebar", async ({ page }) => {
    // Arrange — start on projects page
    await page.goto("/projects");
    await expect(page).toHaveURL("/projects");

    // Act — find and click the Dashboard link in the sidebar
    const dashboardLink = page.locator('a[href="/dashboard"]').first();
    await dashboardLink.click();

    // Assert
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
  });
});
