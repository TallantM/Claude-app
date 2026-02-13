// Vitest configuration — uses jsdom for DOM testing, wires up the @/ path alias,
// and loads the global setup file that extends expect with jest-dom matchers.

import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
