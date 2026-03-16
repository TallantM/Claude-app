import { test, expect } from "@playwright/test";
import { ReposPage } from "./page-objects/repos.page";

/**
 * Repositories E2E tests.
 * Uses saved auth state (via "authenticated" Playwright project).
 */

test.describe("Repos", () => {
  test("should load the repos page with heading and Connect Repository button", async ({ page }) => {
    const reposPage = new ReposPage(page);

    await reposPage.navigate();

    await expect(page).toHaveURL("/repos");
    await expect(page.locator('h1:has-text("Repositories")')).toBeVisible();
    await expect(page.locator('[data-testid="connect-repo-btn"]')).toBeVisible();
  });

  test("should show repo cards or empty state (seed-aware)", async ({ page }) => {
    const reposPage = new ReposPage(page);

    await reposPage.navigate();

    const emptyVisible = await reposPage.isEmptyStateVisible();
    if (emptyVisible) {
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    } else {
      const count = await reposPage.getRepoCardCount();
      expect(count).toBeGreaterThan(0);
    }
  });

  test("should open Connect Repository dialog on button click", async ({ page }) => {
    const reposPage = new ReposPage(page);

    await reposPage.navigate();
    await reposPage.clickConnectRepo();

    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator("#repo-name")).toBeVisible();
    await expect(page.locator("#repo-url")).toBeVisible();
  });

  test("should close dialog on Cancel", async ({ page }) => {
    const reposPage = new ReposPage(page);

    await reposPage.navigate();
    await reposPage.clickConnectRepo();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.getByRole("button", { name: /cancel/i }).click();

    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test("should connect a new repository successfully", async ({ page }) => {
    const reposPage = new ReposPage(page);
    const suffix = String(Date.now()).slice(-5);
    const name = `repo-${suffix}`;
    const url = `https://github.com/org/repo-${suffix}`;

    await reposPage.navigate();

    await reposPage.connectRepo(name, url);

    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    await expect(
      page.locator(`[data-testid="repo-card"]:has-text("${name}")`)
    ).toBeVisible({ timeout: 10000 });
  });

  test("should show validation error for invalid URL", async ({ page }) => {
    const reposPage = new ReposPage(page);

    await reposPage.navigate();
    await reposPage.clickConnectRepo();
    await page.locator("#repo-name").fill("test-repo");
    await page.locator("#repo-url").fill("not-a-valid-url");
    await page.locator('[role="dialog"] button[type="submit"]').click();

    // Dialog should remain open with validation error
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator("text=Must be a valid URL")).toBeVisible({ timeout: 3000 });
  });
});
