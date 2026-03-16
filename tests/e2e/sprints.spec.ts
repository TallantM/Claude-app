import { test, expect } from "@playwright/test";
import { SprintsPage } from "./page-objects/sprints.page";

/**
 * Sprints E2E tests.
 * There is no dedicated /sprints page. Sprints are accessed via the Sprints tab
 * on the project detail page (/projects/[id]).
 * Uses saved auth state (via "authenticated" Playwright project).
 */

test.describe("Sprints", () => {
  test("should navigate to a project and find the Sprints tab", async ({ page }) => {
    const sprintsPage = new SprintsPage(page);

    await sprintsPage.navigate();

    // Project detail page loaded
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("tab", { name: /sprints/i })).toBeVisible();
  });

  test("should Sprints tab show sprint content or empty state", async ({ page }) => {
    const sprintsPage = new SprintsPage(page);

    await sprintsPage.navigate();
    await sprintsPage.clickSprintsTab();

    const emptyVisible = await sprintsPage.isSprintsEmptyStateVisible();
    if (emptyVisible) {
      await expect(page.locator("text=No sprints yet")).toBeVisible();
    } else {
      // Sprint cards present
      const tabpanel = page.locator('[role="tabpanel"][data-state="active"]');
      await expect(tabpanel).toBeVisible();
    }
  });

  test("should show Board tab as default (not Sprints)", async ({ page }) => {
    const sprintsPage = new SprintsPage(page);

    await sprintsPage.navigate();

    // Board tab active by default — kanban column visible
    await expect(page.locator('[data-testid="kanban-col-todo"]')).toBeVisible();
  });

  test("should switch between Board and Sprints tabs correctly", async ({ page }) => {
    const sprintsPage = new SprintsPage(page);

    await sprintsPage.navigate();

    // Click Sprints tab
    await sprintsPage.clickSprintsTab();
    await expect(page.locator('[role="tabpanel"][data-state="active"]')).toBeVisible();

    // Switch back to Board tab
    await sprintsPage.clickBoardTab();
    await expect(page.locator('[data-testid="kanban-col-todo"]')).toBeVisible();
  });

  test("should Back to Projects button navigate to /projects", async ({ page }) => {
    const sprintsPage = new SprintsPage(page);

    await sprintsPage.navigate();

    await page.locator('[data-testid="back-to-projects"]').click();

    await expect(page).toHaveURL("/projects");
  });
});
