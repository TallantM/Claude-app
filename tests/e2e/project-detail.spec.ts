import { test, expect } from "@playwright/test";
import { ProjectDetailPage } from "./page-objects/project-detail.page";
import { ProjectsPage } from "./page-objects/projects.page";

/**
 * Project Detail E2E tests.
 * Uses saved auth state (via playwright config storageState).
 */

test.describe("Project Detail", () => {
  test("1. kanban board renders with all four columns", async ({ page }) => {
    // Arrange — navigate to projects list, then click first project
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigate();
    await page.waitForSelector('[data-testid="project-card"]', { timeout: 10000 });

    // Act
    await page.locator('[data-testid="project-card"]').first().click();
    await page.waitForSelector('[data-testid="kanban-col-todo"]', { timeout: 10000 });

    // Assert — all four kanban columns visible
    await expect(page.locator('[data-testid="kanban-col-todo"]')).toBeVisible();
    await expect(page.locator('[data-testid="kanban-col-in-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="kanban-col-in-review"]')).toBeVisible();
    await expect(page.locator('[data-testid="kanban-col-done"]')).toBeVisible();
  });

  test("2. add a new task via the Board tab Add task button", async ({ page }) => {
    // Arrange — navigate to first project
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigate();
    await page.waitForSelector('[data-testid="project-card"]', { timeout: 10000 });
    await page.locator('[data-testid="project-card"]').first().click();
    await page.waitForSelector('[data-testid="kanban-col-todo"]', { timeout: 10000 });

    // Pattern 5: unique name suffix
    const suffix = String(Date.now()).slice(-5);
    const taskName = `E2E Task ${suffix}`;

    // Act — click "Add task" in todo column
    await page
      .locator('[data-testid="kanban-col-todo"]')
      .getByRole("button", { name: /add task/i })
      .click();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await page.fill("#task-title", taskName);
    await page.click('button[type="submit"]:has-text("Create Task")');

    // Assert
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 10000 });
    await expect(
      page.locator('[data-testid="kanban-col-todo"]').getByText(taskName)
    ).toBeVisible({ timeout: 10000 });
  });

  test("3. clicking task card opens task detail dialog", async ({ page }) => {
    // Arrange — navigate to first project that has tasks
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigate();
    await page.waitForSelector('[data-testid="project-card"]', { timeout: 10000 });
    await page.locator('[data-testid="project-card"]').first().click();
    await page.waitForSelector('[data-testid="kanban-col-todo"]', { timeout: 10000 });

    const taskCards = page.locator('[data-testid="task-card"]');
    const taskCount = await taskCards.count();
    if (taskCount === 0) {
      test.skip();
      return;
    }

    // Act
    const firstTask = taskCards.first();
    const taskTitle = await firstTask.textContent();
    await firstTask.click();

    // Assert
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    if (taskTitle) {
      await expect(page.locator('[role="dialog"]')).toContainText(taskTitle.trim().slice(0, 20));
    }
  });

  test("4. back button navigates to /projects list", async ({ page }) => {
    // Arrange — navigate to first project
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigate();
    await page.waitForSelector('[data-testid="project-card"]', { timeout: 10000 });
    await page.locator('[data-testid="project-card"]').first().click();
    await page.waitForSelector('[data-testid="back-to-projects"]', { timeout: 10000 });

    // Act
    await page.click('[data-testid="back-to-projects"]');

    // Assert
    await expect(page).toHaveURL(/\/projects$/, { timeout: 10000 });
    await page.waitForSelector(
      '[data-testid="project-card"], [data-testid="empty-state"]',
      { timeout: 10000 }
    );
  });

  test("5. Sprints tab is accessible and renders sprint content", async ({ page }) => {
    // Arrange
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigate();
    await page.waitForSelector('[data-testid="project-card"]', { timeout: 10000 });
    await page.locator('[data-testid="project-card"]').first().click();
    await page.waitForSelector('[data-testid="kanban-col-todo"]', { timeout: 10000 });

    // Act
    await page.getByRole("tab", { name: /sprints/i }).click();

    // Assert
    await expect(page.locator('[role="tabpanel"]').last()).toBeVisible({ timeout: 5000 });
    // Either a sprint card or "No sprints yet" message
    const sprintContent = page.locator('text=/sprint|No sprints yet/i');
    await expect(sprintContent.first()).toBeVisible({ timeout: 5000 });
  });
});
