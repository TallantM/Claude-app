import { test, expect } from "@playwright/test";
import { ProjectsPage } from "./page-objects/projects.page";

/**
 * Projects E2E tests.
 * Uses saved auth state (via "authenticated" Playwright project).
 * Requires a seeded database with at least a few projects.
 */

test.describe("Projects", () => {
  test("should load the projects page with heading and New Project button", async ({ page }) => {
    // Arrange
    const projectsPage = new ProjectsPage(page);

    // Act
    await projectsPage.navigateTo();

    // Assert
    await expect(page).toHaveURL("/projects");
    await expect(page.locator('h1:has-text("Projects")')).toBeVisible();
    await expect(page.getByRole("button", { name: "New Project" })).toBeVisible();
    await expect(page.getByPlaceholder("Search projects...")).toBeVisible();
  });

  test("should open create project dialog on New Project click", async ({ page }) => {
    // Arrange
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigateTo();

    // Act
    await projectsPage.clickNewProject();

    // Assert
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Create New Project')).toBeVisible();
    await expect(page.locator('[role="dialog"] #name')).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Project" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  });

  test("should close dialog on Cancel click", async ({ page }) => {
    // Arrange
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigateTo();
    await projectsPage.clickNewProject();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Act
    await page.getByRole("button", { name: "Cancel" }).click();

    // Assert
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test("should create a new project and show it in the list", async ({ page }) => {
    // Arrange
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigateTo();
    const projectName = `E2E Test Project ${Date.now()}`;

    // Act
    await projectsPage.createProject(projectName, "Created by E2E test");

    // Assert — dialog closed and project appears in grid
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${projectName}`)).toBeVisible({ timeout: 10000 });
  });

  test("should search projects and filter the visible list", async ({ page }) => {
    // Arrange — first create a project with a unique name to search for
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigateTo();
    const uniqueName = `SearchTest-${Date.now()}`;
    await projectsPage.createProject(uniqueName);

    // Act — search for the unique name
    await projectsPage.searchProjects(uniqueName);

    // Assert — only matching projects shown
    await expect(page.locator(`text=${uniqueName}`)).toBeVisible({ timeout: 5000 });
  });

  test("should navigate to project detail on card click", async ({ page }) => {
    // Arrange
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigateTo();

    // Act — click the first project card visible
    const firstCard = page.locator(".cursor-pointer").first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    await firstCard.click();

    // Assert — URL changed to /projects/{id}
    await expect(page).toHaveURL(/\/projects\/\w+/, { timeout: 10000 });
  });

  test("should show empty state when no projects match search", async ({ page }) => {
    // Arrange
    const projectsPage = new ProjectsPage(page);
    await projectsPage.navigateTo();

    // Act
    await projectsPage.searchProjects("zzz-no-match-xyz-99999");

    // Assert
    await expect(page.locator('text=No projects found')).toBeVisible({ timeout: 5000 });
  });
});
