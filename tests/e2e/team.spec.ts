import { test, expect } from "@playwright/test";
import { TeamPage } from "./page-objects/team.page";

/**
 * Team E2E tests.
 * Uses saved auth state (via "authenticated" Playwright project).
 */

test.describe("Team", () => {
  test("should load the team page with heading and Invite Member button", async ({ page }) => {
    const teamPage = new TeamPage(page);

    await teamPage.navigate();

    await expect(page).toHaveURL("/team");
    await expect(page.locator('h1:has-text("Team Management")')).toBeVisible();
    await expect(page.getByRole("button", { name: /invite member/i })).toBeVisible();
  });

  test("should show member cards or empty state (seed-aware)", async ({ page }) => {
    const teamPage = new TeamPage(page);

    await teamPage.navigate();

    // Wait for loading to complete — either empty state or member cards must appear
    await page.waitForSelector(
      '[data-testid="member-card"], [data-testid="empty-state"]',
      { timeout: 15000 }
    );

    const emptyVisible = await teamPage.isEmptyStateVisible();
    if (emptyVisible) {
      await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
    } else {
      const count = await teamPage.getMemberCardCount();
      expect(count).toBeGreaterThan(0);
    }
  });

  test("should open invite dialog on Invite Member click", async ({ page }) => {
    const teamPage = new TeamPage(page);

    await teamPage.navigate();
    await teamPage.clickInviteMember();

    await expect(page.locator('[role="dialog"]')).toBeVisible();
    await expect(page.locator('text=Invite Team Member')).toBeVisible();
    await expect(page.locator("#inv-name")).toBeVisible();
    await expect(page.locator("#inv-email")).toBeVisible();
  });

  test("should close invite dialog on Cancel", async ({ page }) => {
    const teamPage = new TeamPage(page);

    await teamPage.navigate();
    await teamPage.clickInviteMember();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.getByRole("button", { name: /cancel/i }).click();

    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test("should invite a new team member successfully", async ({ page }) => {
    const teamPage = new TeamPage(page);
    const suffix = String(Date.now()).slice(-5);
    const email = `invite${suffix}@test.example.com`;

    await teamPage.navigate();
    const initialCount = await teamPage.getMemberCardCount();

    await teamPage.inviteMember(`Test Member ${suffix}`, email);

    // Dialog should be closed and member count should increase
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
    await page.waitForLoadState("networkidle");
    const finalCount = await teamPage.getMemberCardCount();
    expect(finalCount).toBeGreaterThan(initialCount);
  });

  test("should show stat cards for Total Members, Admins, Developers", async ({ page }) => {
    const teamPage = new TeamPage(page);

    await teamPage.navigate();

    await expect(page.locator('text=Total Members')).toBeVisible();
    await expect(page.locator('text=Admins')).toBeVisible();
    await expect(page.locator('text=Developers')).toBeVisible();
  });
});
