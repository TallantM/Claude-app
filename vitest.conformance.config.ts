import { defineConfig } from "vitest/config";
import path from "path";

/**
 * Vitest config for conformance tests.
 * Uses node environment (not jsdom) — conformance tests read files from disk.
 * Pattern 8: separate config required for conformance tests.
 */
export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/conformance/**/*.{test,spec}.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
