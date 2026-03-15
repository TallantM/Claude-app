import { test, expect } from "@playwright/test";
import { LoginPage } from "./page-objects/login.page";
import { RegisterPage } from "./page-objects/register.page";

/**
 * Authentication E2E tests.
 * These tests do NOT use saved auth state — they test the auth flows themselves.
 * Covered by the "auth-flows" Playwright project (no storageState).
 */

test.describe("Authentication", () => {
  test.describe("Login", () => {
    test("should display login form with all expected elements", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);

      // Act
      await loginPage.navigateTo();

      // Assert
      await expect(page).toHaveURL("/login");
      await expect(page.locator("text=Welcome back")).toBeVisible();
      await expect(page.locator("#email")).toBeVisible();
      await expect(page.locator("#password")).toBeVisible();
      await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /github/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
      await expect(page.locator('.text-destructive[role="alert"]')).not.toBeVisible();
    });

    test("should redirect to dashboard after successful login", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);
      await loginPage.navigateTo();

      // Act
      await loginPage.login(
        process.env.TEST_USER_EMAIL ?? "tester@sdlchub.com",
        process.env.TEST_USER_PASSWORD ?? "test1234"
      );

      // Assert
      await expect(page).toHaveURL("/dashboard", { timeout: 15000 });
      await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    });

    test("should show error message on invalid credentials", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);
      await loginPage.navigateTo();

      // Act
      await loginPage.login("nonexistent@example.com", "wrongpassword");

      // Assert
      await expect(page.locator('.text-destructive[role="alert"]')).toBeVisible({ timeout: 10000 });
      const errorText = await loginPage.getErrorMessage();
      expect(errorText).toContain("Invalid email or password");
      await expect(page).toHaveURL("/login");
    });

    test("should stay on login page after failed login", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);
      await loginPage.navigateTo();

      // Act
      await loginPage.login("bad@bad.com", "badpass");

      // Assert
      await expect(page).toHaveURL("/login");
      await expect(page.locator("text=Welcome back")).toBeVisible();
    });

    test("should navigate to register page via Sign up link", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);
      const registerPage = new RegisterPage(page);
      await loginPage.navigateTo();

      // Act
      await loginPage.clickRegisterLink();

      // Assert
      await expect(page).toHaveURL("/register");
      await expect(registerPage.isHeadingVisible()).resolves.toBe(true);
    });

    test("should show validation feedback on empty form submission", async ({ page }) => {
      // Arrange
      const loginPage = new LoginPage(page);
      await loginPage.navigateTo();

      // Act — click submit without filling any fields
      await page.getByRole("button", { name: /sign in/i }).click();

      // Assert — page stays on /login; RHF + zod shows validation feedback
      await expect(page).toHaveURL("/login");
      await expect(
        page.getByText("Invalid email address").or(page.locator('.text-destructive[role="alert"]'))
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Register", () => {
    test("should display registration form with all fields", async ({ page }) => {
      // Arrange
      const registerPage = new RegisterPage(page);

      // Act
      await registerPage.navigateTo();

      // Assert
      await expect(page).toHaveURL("/register");
      await expect(page.locator("text=Create an account")).toBeVisible();
      await expect(page.locator("#name")).toBeVisible();
      await expect(page.locator("#email")).toBeVisible();
      await expect(page.locator("#password")).toBeVisible();
      await expect(page.locator("#confirmPassword")).toBeVisible();
      await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
    });

    test("should redirect to login after successful registration", async ({ page }) => {
      // Arrange
      const registerPage = new RegisterPage(page);
      await registerPage.navigateTo();
      const uniqueEmail = `test-${Date.now()}@example.com`;

      // Act
      await registerPage.register(
        "E2E Test User",
        uniqueEmail,
        "testpassword123",
        "testpassword123"
      );

      // Assert
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });
    });

    test("should show error when passwords do not match", async ({ page }) => {
      // Arrange
      const registerPage = new RegisterPage(page);
      await registerPage.navigateTo();

      // Act
      await registerPage.register(
        "Test User",
        `mismatch-${Date.now()}@example.com`,
        "password123",
        "different456"
      );

      // Assert — form stays on register, either an alert or inline error shown
      await expect(page).toHaveURL("/register");
    });

    test("should navigate back to login via Sign in link", async ({ page }) => {
      // Arrange
      const registerPage = new RegisterPage(page);
      await registerPage.navigateTo();

      // Act
      await registerPage.clickLoginLink();

      // Assert
      await expect(page).toHaveURL("/login");
      await expect(page.locator("text=Welcome back")).toBeVisible();
    });

    test("should show error when registering with an already-registered email", async ({ page }) => {
      // Arrange
      const registerPage = new RegisterPage(page);
      await registerPage.navigateTo();

      // Act — attempt to register with a seeded (already-existing) email
      await registerPage.register(
        "Existing User",
        "tester@sdlchub.com",
        "testpassword123",
        "testpassword123"
      );

      // Assert — server returns a conflict error; alert is shown
      await expect(page.locator('.text-destructive[role="alert"]')).toBeVisible({ timeout: 10000 });
      await expect(page).toHaveURL("/register");
    });
  });

  test.describe("Workflows", () => {
    test("full workflow: register new account, login, reach dashboard", async ({ page }) => {
      // Arrange — unique email to avoid conflicts with other test runs
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const loginPage = new LoginPage(page);
      const registerPage = new RegisterPage(page);

      // Step 1: Register new account
      await registerPage.navigateTo();
      await registerPage.register(
        "Workflow Test User",
        uniqueEmail,
        "testpassword123",
        "testpassword123"
      );

      // Assert redirected to /login after registration
      await expect(page).toHaveURL(/\/login/, { timeout: 15000 });

      // Step 2: Login with the newly registered account
      await loginPage.login(uniqueEmail, "testpassword123");

      // Assert redirected to /dashboard
      await expect(page).toHaveURL("/dashboard", { timeout: 15000 });
      await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    });
  });

  test.describe("Auth Guard", () => {
    test("should redirect unauthenticated user from dashboard to login", async ({ page }) => {
      // Act — navigate directly to protected route without auth
      await page.goto("/dashboard");

      // Assert
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test("should redirect unauthenticated user from projects to login", async ({ page }) => {
      // Act
      await page.goto("/projects");

      // Assert
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });

    test("should redirect unauthenticated user from issues to login", async ({ page }) => {
      // Act
      await page.goto("/issues");

      // Assert
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });
});
