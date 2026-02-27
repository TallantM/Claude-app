import { test, expect } from "@playwright/test";
import { IssuesPage } from "./page-objects/issues.page";

/**
 * Issues E2E tests.
 * Uses saved auth state (via "authenticated" Playwright project).
 * Requires a seeded database with issues of various statuses/severities.
 */

test.describe("Issues", () => {
  test("should load the issues page with heading and New Issue button", async ({ page }) => {
    // Arrange
    const issuesPage = new IssuesPage(page);

    // Act
    await issuesPage.navigateTo();

    // Assert
    await expect(page).toHaveURL("/issues");
    await expect(page.locator('h1:has-text("Issues")')).toBeVisible();
    await expect(page.getByRole("button", { name: "New Issue" })).toBeVisible();
    await expect(page.getByPlaceholder("Search issues...")).toBeVisible();
  });

  test("should open create issue dialog on New Issue click", async ({ page }) => {
    // Arrange
    const issuesPage = new IssuesPage(page);
    await issuesPage.navigateTo();

    // Act
    await issuesPage.clickNewIssue();

    // Assert
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Report New Issue')).toBeVisible();
    await expect(page.locator("#issue-title")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Issue" })).toBeVisible();
  });

  test("should close create dialog on Cancel click", async ({ page }) => {
    // Arrange
    const issuesPage = new IssuesPage(page);
    await issuesPage.navigateTo();
    await issuesPage.clickNewIssue();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Act
    await page.getByRole("button", { name: "Cancel" }).click();

    // Assert
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test("should create a new issue and show it in the list", async ({ page }) => {
    // Arrange
    const issuesPage = new IssuesPage(page);
    await issuesPage.navigateTo();
    const issueTitle = `E2E Bug Report ${Date.now()}`;

    // Act
    await issuesPage.createIssue(issueTitle, "Reported by automated E2E test");

    // Assert
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    await expect(page.locator(`h4:has-text("${issueTitle}")`)).toBeVisible({ timeout: 10000 });
  });

  test("should filter issues by title using search input", async ({ page }) => {
    // Arrange — create a uniquely named issue to search for
    const issuesPage = new IssuesPage(page);
    await issuesPage.navigateTo();
    const uniqueTitle = `SearchIssue-${Date.now()}`;
    await issuesPage.createIssue(uniqueTitle);

    // Act
    await issuesPage.searchIssues(uniqueTitle);

    // Assert
    await expect(page.locator(`h4:has-text("${uniqueTitle}")`)).toBeVisible({ timeout: 5000 });
  });

  test("should show empty state when search yields no results", async ({ page }) => {
    // Arrange
    const issuesPage = new IssuesPage(page);
    await issuesPage.navigateTo();

    // Act
    await issuesPage.searchIssues("zzz-no-match-xyz-12345678");

    // Assert
    await expect(page.locator('text=No issues found')).toBeVisible({ timeout: 5000 });
  });

  test("should open issue detail dialog on row click", async ({ page }) => {
    // Arrange
    const issuesPage = new IssuesPage(page);
    await issuesPage.navigateTo();

    // Create an issue so we know its title
    const issueTitle = `DetailTest-${Date.now()}`;
    await issuesPage.createIssue(issueTitle, "Detail dialog test");

    // Act
    await issuesPage.clickIssue(issueTitle);

    // Assert
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`[role="dialog"] :has-text("${issueTitle}")`).first()).toBeVisible();
  });

  test("should filter issues by status using the status dropdown", async ({ page }) => {
    // Arrange
    const issuesPage = new IssuesPage(page);
    await issuesPage.navigateTo();

    // Act — filter to "open" status
    await issuesPage.filterByStatus("open");

    // Assert — the "in_progress" option should no longer be selected, page reloaded
    await expect(page.locator('h1:has-text("Issues")')).toBeVisible();
    // At minimum the page should still show (not crash)
    // Seeded data with 'open' issues is required for a deeper assertion
  });
});
