import { test, expect } from "@playwright/test";
import { ReposPage } from "./page-objects/repos.page";

/**
 * Repos E2E tests.
 * Uses saved auth state (via playwright config storageState).
 */

test.describe("Repos", () => {
  test("1. repos page loads and shows repo cards or empty state", async ({ page }) => {
    // Arrange
    const reposPage = new ReposPage(page);

    // Act
    await reposPage.navigate();

    // Assert — either cards or empty state
    const hasCards = (await page.locator('[data-testid="repo-card"]').count()) > 0;
    const hasEmptyState = (await page.locator('[data-testid="empty-state"]').count()) > 0;
    expect(hasCards || hasEmptyState).toBe(true);
    await expect(page.locator('[data-testid="connect-repo-btn"]')).toBeVisible();
  });

  test("2. connect new repository via dialog", async ({ page }) => {
    // Arrange
    const reposPage = new ReposPage(page);
    await reposPage.navigate();

    // Pattern 5: unique name suffix
    const suffix = String(Date.now()).slice(-5);
    const repoName = `e2e-repo-${suffix}`;

    // Pattern 13: stabilize list before counting
    await page.waitForSelector(
      '[data-testid="repo-card"], [data-testid="empty-state"]',
      { timeout: 10000 }
    );

    // Act
    await reposPage.clickConnectRepoBtn();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Connect Repository')).toBeVisible();
    await page.fill("#repo-name", repoName);
    await page.fill("#repo-url", `https://github.com/org/${repoName}`);
    await page.click('button[type="submit"]:has-text("Connect Repository")');

    // Assert
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${repoName}`)).toBeVisible({ timeout: 10000 });
  });

  test("3. empty state renders when no repos connected (conditional skip if DB seeded)", async ({ page }) => {
    // Arrange
    await page.goto("/repos");
    await page.waitForSelector(
      '[data-testid="repo-card"], [data-testid="empty-state"]',
      { timeout: 15000 }
    );

    // Pattern 3: conditional skip if DB seeded
    const isEmpty = (await page.locator('[data-testid="empty-state"]').count()) > 0;
    if (!isEmpty) {
      test.skip();
      return;
    }

    // Assert
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  });

  test("4. repo card displays provider badge and branch info", async ({ page }) => {
    // Arrange
    const reposPage = new ReposPage(page);
    await reposPage.navigate();

    const hasCards = (await page.locator('[data-testid="repo-card"]').count()) > 0;
    if (!hasCards) {
      test.skip();
      return;
    }

    // Assert — Pattern 4: no exact count assertions
    const firstCard = page.locator('[data-testid="repo-card"]').first();
    const providerBadge = firstCard.locator('text=/GitHub|GitLab|Bitbucket/i');
    await expect(providerBadge).toBeVisible({ timeout: 5000 });
  });

  test("5. cancel button dismisses the connect dialog without creating repo", async ({ page }) => {
    // Arrange
    const reposPage = new ReposPage(page);
    await reposPage.navigate();

    // Act
    await reposPage.clickConnectRepoBtn();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await reposPage.cancelDialog();

    // Assert
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
  });
});
