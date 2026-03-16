import { test, expect } from "@playwright/test";
import { PipelinesPage } from "./page-objects/pipelines.page";

/**
 * Pipelines E2E tests.
 * Uses saved auth state (via "authenticated" Playwright project).
 */

test.describe("Pipelines", () => {
  test("should load the pipelines page with heading", async ({ page }) => {
    const pipelinesPage = new PipelinesPage(page);

    await pipelinesPage.navigate();

    await expect(page).toHaveURL("/pipelines");
    await expect(page.locator('h1:has-text("CI/CD Pipelines")')).toBeVisible();
  });

  test("should show empty state or pipeline cards (seed-aware)", async ({ page }) => {
    const pipelinesPage = new PipelinesPage(page);

    await pipelinesPage.navigate();

    const emptyState = page.locator('[data-testid="empty-state"]');
    const cards = page.locator('[data-testid="pipeline-card"]');

    const emptyVisible = await emptyState.isVisible();
    if (emptyVisible) {
      await expect(emptyState).toBeVisible();
    } else {
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test("should show Trigger Run button on pipeline cards", async ({ page }) => {
    const pipelinesPage = new PipelinesPage(page);

    await pipelinesPage.navigate();

    const emptyVisible = await pipelinesPage.isEmptyStateVisible();
    if (emptyVisible) {
      test.skip();
      return;
    }

    await expect(
      page.locator('[data-testid="pipeline-card"]').first().getByRole("button", { name: /trigger run/i })
    ).toBeVisible();
  });

  test("should expand and collapse pipeline details", async ({ page }) => {
    const pipelinesPage = new PipelinesPage(page);

    await pipelinesPage.navigate();

    const emptyVisible = await pipelinesPage.isEmptyStateVisible();
    if (emptyVisible) {
      test.skip();
      return;
    }

    // Expand
    await pipelinesPage.toggleDetails(0);

    // The expanded section should be visible — look for Stages or Recent Runs heading
    const firstCard = page.locator('[data-testid="pipeline-card"]').first();
    // Use first() to avoid strict mode violation when multiple h4/space-y-4 elements exist
    await expect(firstCard.locator("h4, .space-y-4").first()).toBeVisible({ timeout: 5000 });

    // Collapse
    await pipelinesPage.toggleDetails(0);
  });

  test("should allow clicking Trigger Run without crashing", async ({ page }) => {
    const pipelinesPage = new PipelinesPage(page);

    await pipelinesPage.navigate();

    const emptyVisible = await pipelinesPage.isEmptyStateVisible();
    if (emptyVisible) {
      test.skip();
      return;
    }

    // Click Trigger Run — button should not cause a page crash
    const firstCard = page.locator('[data-testid="pipeline-card"]').first();
    const triggerBtn = firstCard.getByRole("button", { name: /trigger run/i });
    await triggerBtn.click();

    // Page should still show the heading — no crash
    await expect(page.locator('h1:has-text("CI/CD Pipelines")')).toBeVisible({ timeout: 10000 });
  });

  test("should render pipeline page without JavaScript errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const pipelinesPage = new PipelinesPage(page);
    await pipelinesPage.navigate();

    expect(errors).toHaveLength(0);
    await expect(page.locator('h1:has-text("CI/CD Pipelines")')).toBeVisible();
  });
});
