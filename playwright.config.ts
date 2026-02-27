import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, ".env.test") });

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false, // Sequential: avoid DB contention in SQLite
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for SQLite
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["allure-playwright", { outputFolder: "allure-results" }],
    ["list"],
  ],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    headless: true,
    viewport: { width: 1280, height: 720 },
    // Increase timeouts for CI
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },

  projects: [
    // Auth setup project — runs before authenticated tests
    {
      name: "setup",
      testMatch: "**/auth.setup.ts",
    },

    // E2E tests that require authentication — auth flows are excluded (they run in auth-flows)
    {
      name: "authenticated",
      testMatch: [
        "**/dashboard.spec.ts",
        "**/projects.spec.ts",
        "**/issues.spec.ts",
      ],
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/e2e/.auth/user.json",
      },
    },

    // Auth tests (login/register) — no saved state
    {
      name: "auth-flows",
      testMatch: "**/authentication.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        storageState: undefined,
      },
    },
  ],

  // Start the Next.js dev server before running tests
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes for Next.js cold start
    stdout: "ignore",
    stderr: "pipe",
  },
});
