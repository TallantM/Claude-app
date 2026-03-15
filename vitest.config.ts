import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/unit/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    exclude: ["tests/conformance/**", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Scope: only the page components with unit test coverage.
      // Layout, store, types, and UI primitives are excluded — they have no
      // unit-testable business logic and are covered by E2E tests instead.
      include: [
        "src/app/[(]auth[)]/login/page.tsx",
        "src/app/[(]auth[)]/register/page.tsx",
        "src/app/[(]app[)]/dashboard/page.tsx",
        "src/app/[(]app[)]/projects/page.tsx",
        "src/app/[(]app[)]/issues/page.tsx",
      ],
      thresholds: {
        statements: 70,
        branches: 55,  // Branch coverage is harder; full conditional coverage is E2E scope
        functions: 70,
        lines: 70,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
