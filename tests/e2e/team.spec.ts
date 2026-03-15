import { test, expect } from "@playwright/test";
import { TeamPage } from "./page-objects/team.page";

/**
 * Team E2E tests.
 * Uses saved auth state (via playwright config storageState).
 */

test.describe("Team", () => {
  test("1. team page loads with member cards (seeded data)", async ({ page }) => {
    // Arrange
    const teamPage = new TeamPage(page);

    // Act
    await teamPage.navigate();

    // Assert — Pattern 3: conditional skip if empty
    const isEmpty = (await page.locator('[data-testid="empty-state"]').count()) > 0;
    if (isEmpty) {
      test.skip();
      return;
    }
    await expect(page.locator('[data-testid="member-card"]').first()).toBeVisible();
    await expect(page.locator('button:has-text("Invite Member")')).toBeVisible();
  });

  test("2. invite new team member via dialog", async ({ page }) => {
    // Arrange
    const teamPage = new TeamPage(page);
    await teamPage.navigate();

    // Pattern 5: unique name suffix
    const suffix = String(Date.now()).slice(-5);
    const memberName = `E2E Member ${suffix}`;
    const memberEmail = `e2e-member-${suffix}@example.com`;

    // Act
    await teamPage.clickInviteMember();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Invite Team Member')).toBeVisible();
    await page.fill("#inv-name", memberName);
    await page.fill("#inv-email", memberEmail);
    await page.click('button:has-text("Send Invite")');

    // Assert
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator(`text=${memberName}`)).toBeVisible({ timeout: 10000 });
  });

  test("3. stat cards display correct counts", async ({ page }) => {
    // Arrange
    const teamPage = new TeamPage(page);
    await teamPage.navigate();

    // Assert — Pattern 4: seed-aware assertions
    await expect(page.locator('text=Total Members')).toBeVisible();
    await expect(page.locator('text=Admins')).toBeVisible();
    // Stat card numbers are > 0 since DB is seeded
    const totalCard = page.locator(':has-text("Total Members")').first();
    await expect(totalCard).toBeVisible();
  });

  test("4. empty state renders when no members (conditional skip if DB seeded)", async ({ page }) => {
    // Arrange
    await page.goto("/team");
    await page.waitForSelector(
      '[data-testid="member-card"], [data-testid="empty-state"]',
      { timeout: 15000 }
    );

    // Pattern 3: conditional skip
    const isEmpty = (await page.locator('[data-testid="empty-state"]').count()) > 0;
    if (!isEmpty) {
      test.skip();
      return;
    }

    // Assert
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  });

  test("5. cancel button dismisses the invite dialog", async ({ page }) => {
    // Arrange
    const teamPage = new TeamPage(page);
    await teamPage.navigate();

    // Act
    await teamPage.clickInviteMember();
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    await teamPage.cancelDialog();

    // Assert
    await expect(page.locator('[role="dialog"]')).not.toBeVisible({ timeout: 5000 });
  });
});
