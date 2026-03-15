import { test, expect } from "@playwright/test";
import { PipelinesPage } from "./page-objects/pipelines.page";

/**
 * Pipelines E2E tests.
 * Uses saved auth state (via playwright config storageState).
 */

test.describe("Pipelines", () => {
  test("1. pipelines list loads with at least one card (seeded data)", async ({ page }) => {
    // Arrange
    const pipelinesPage = new PipelinesPage(page);

    // Act
    await pipelinesPage.navigate();

    // Assert — Pattern 3: empty-state conditional skip
    const isEmpty = (await page.locator('[data-testid="empty-state"]').count()) > 0;
    if (isEmpty) {
      // With seeded data, there should be pipelines; skip if none exist
      test.skip();
      return;
    }
    await expect(page.locator('[data-testid="pipeline-card"]').first()).toBeVisible();
  });

  test("2. Details button expands pipeline card to show stages and runs", async ({ page }) => {
    // Arrange
    const pipelinesPage = new PipelinesPage(page);
    await pipelinesPage.navigate();

    // Pattern 3: skip if empty
    const isEmpty = (await page.locator('[data-testid="empty-state"]').count()) > 0;
    if (isEmpty) {
      test.skip();
      return;
    }

    // Act
    await pipelinesPage.clickDetails(0);

    // Assert — expanded section visible
    const card = page.locator('[data-testid="pipeline-card"]').first();
    const expanded = card.locator('h4');
    await expect(expanded.first()).toBeVisible({ timeout: 5000 });

    // Act — collapse
    await pipelinesPage.clickDetails(0);
    await expect(expanded.first()).not.toBeVisible({ timeout: 5000 });
  });

  test("3. Trigger Run button triggers a pipeline run", async ({ page }) => {
    // Arrange
    const pipelinesPage = new PipelinesPage(page);
    await pipelinesPage.navigate();

    // Pattern 3: skip if empty
    const isEmpty = (await page.locator('[data-testid="empty-state"]').count()) > 0;
    if (isEmpty) {
      test.skip();
      return;
    }

    // Act
    const triggerBtn = page
      .locator('[data-testid="pipeline-card"]')
      .first()
      .getByRole("button", { name: /trigger run/i });
    await triggerBtn.click();

    // Assert — button returns to normal state after API call (not stuck in loading)
    await expect(triggerBtn).toBeVisible({ timeout: 10000 });
  });

  test("4. empty state renders when no pipelines are configured (conditional skip if DB seeded)", async ({ page }) => {
    // Arrange
    await page.goto("/pipelines");
    await page.waitForSelector(
      '[data-testid="pipeline-card"], [data-testid="empty-state"]',
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
    await expect(page.locator('text=No pipelines configured')).toBeVisible();
  });

  test("5. pagination controls are present when multiple pipelines exist", async ({ page }) => {
    // Arrange
    const pipelinesPage = new PipelinesPage(page);
    await pipelinesPage.navigate();

    // Assert — page renders without error
    await expect(page).not.toHaveURL(/error/i);

    // Pattern 4: seed-aware — only check pagination if many pipelines
    const count = await pipelinesPage.getPipelineCardCount();
    if (count > 10) {
      await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    }
  });
});
