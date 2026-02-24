import { test as setup, expect } from "@playwright/test";
import path from "path";

const AUTH_FILE = path.join(__dirname, ".auth/user.json");

/**
 * Auth setup: logs in as the test user and saves auth state to disk.
 * All "authenticated" tests use this saved state to avoid re-logging in.
 */
setup("authenticate as test user", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "TEST_USER_EMAIL and TEST_USER_PASSWORD must be set in .env.test"
    );
  }

  await page.goto("/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard after successful login
  await expect(page).toHaveURL("/dashboard", { timeout: 15000 });

  // Save the authenticated state (cookies + localStorage)
  await page.context().storageState({ path: AUTH_FILE });
});
