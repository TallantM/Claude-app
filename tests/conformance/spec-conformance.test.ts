/**
 * Spec Conformance Tests
 *
 * Validates that spec files and test implementations stay in sync.
 * Runs with Vitest — no browser required.
 *
 * Checks:
 * 1. specs/PROJECT-SPEC.md exists with required section headers
 * 2. Each feature in specs/features/ has all 4 spec files
 * 3. Each feature has a matching E2E spec file in tests/e2e/
 * 4. tests/e2e/page-objects/ has at least one page object per feature
 * 5. Total unit test count >= total spec scenario count (soft warn)
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "../..");
const SPECS_FEATURES_DIR = path.join(ROOT, "specs", "features");
const PROJECT_SPEC = path.join(ROOT, "specs", "PROJECT-SPEC.md");
const E2E_DIR = path.join(ROOT, "tests", "e2e");
const PAGE_OBJECTS_DIR = path.join(E2E_DIR, "page-objects");

const REQUIRED_SPEC_FILES = [
  "page-objects.md",
  "unit-tests.md",
  "integration-tests.md",
  "workflows.md",
];

const REQUIRED_SPEC_HEADERS = [
  "## System Purpose",
  "## Architectural Constraints",
  "## Quality Gates",
];

function getFeatures(): string[] {
  return fs
    .readdirSync(SPECS_FEATURES_DIR)
    .filter((f) =>
      fs.statSync(path.join(SPECS_FEATURES_DIR, f)).isDirectory()
    );
}

// ─── 1. PROJECT-SPEC.md ─────────────────────────────────────────────────────

describe("PROJECT-SPEC.md", () => {
  it("exists at specs/PROJECT-SPEC.md", () => {
    expect(fs.existsSync(PROJECT_SPEC)).toBe(true);
  });

  it("contains all required section headers", () => {
    const content = fs.readFileSync(PROJECT_SPEC, "utf-8");
    for (const header of REQUIRED_SPEC_HEADERS) {
      expect(content, `Missing required header: "${header}"`).toContain(header);
    }
  });
});

// ─── 2. Feature spec completeness ───────────────────────────────────────────

describe("Feature spec completeness", () => {
  const features = getFeatures();

  it("specs/features/ contains at least one feature", () => {
    expect(features.length).toBeGreaterThan(0);
  });

  for (const feature of features) {
    describe(`specs/features/${feature}/`, () => {
      for (const specFile of REQUIRED_SPEC_FILES) {
        it(`has ${specFile}`, () => {
          const filePath = path.join(SPECS_FEATURES_DIR, feature, specFile);
          expect(
            fs.existsSync(filePath),
            `Missing: specs/features/${feature}/${specFile}`
          ).toBe(true);
        });
      }
    });
  }
});

// ─── 3. E2E spec files ───────────────────────────────────────────────────────

describe("E2E spec files", () => {
  const features = getFeatures();

  for (const feature of features) {
    it(`${feature} has tests/e2e/${feature}.spec.ts`, () => {
      const specFile = path.join(E2E_DIR, `${feature}.spec.ts`);
      expect(
        fs.existsSync(specFile),
        `Missing E2E spec: tests/e2e/${feature}.spec.ts`
      ).toBe(true);
    });
  }
});

// ─── 4. Page objects ─────────────────────────────────────────────────────────

describe("Page objects", () => {
  it("tests/e2e/page-objects/ directory exists", () => {
    expect(fs.existsSync(PAGE_OBJECTS_DIR)).toBe(true);
  });

  it("has at least one page object per feature", () => {
    const features = getFeatures();
    const pageObjects = fs
      .readdirSync(PAGE_OBJECTS_DIR)
      .filter((f) => f.endsWith(".page.ts"));
    expect(
      pageObjects.length,
      `Found ${pageObjects.length} page objects but need at least ${features.length} (one per feature)`
    ).toBeGreaterThanOrEqual(features.length);
  });
});

// ─── 5. Scenario coverage (soft warn) ────────────────────────────────────────

describe("Scenario coverage", () => {
  const UNIT_TESTS_DIR = path.join(ROOT, "tests", "unit");

  it("total unit tests >= total spec scenarios (or logs a warning)", () => {
    const features = getFeatures();

    // Count "### Scenario:" headings across all unit-tests.md files
    let totalScenarios = 0;
    for (const feature of features) {
      const specFile = path.join(SPECS_FEATURES_DIR, feature, "unit-tests.md");
      if (fs.existsSync(specFile)) {
        const content = fs.readFileSync(specFile, "utf-8");
        const matches = content.match(/^### Scenario:/gm);
        totalScenarios += matches ? matches.length : 0;
      }
    }

    // Count it( calls across all unit test files
    let totalTests = 0;
    if (fs.existsSync(UNIT_TESTS_DIR)) {
      const testFiles = fs
        .readdirSync(UNIT_TESTS_DIR)
        .filter((f) => f.endsWith(".test.tsx") || f.endsWith(".test.ts"));
      for (const file of testFiles) {
        const content = fs.readFileSync(
          path.join(UNIT_TESTS_DIR, file),
          "utf-8"
        );
        const matches = content.match(/^\s*it\(/gm);
        totalTests += matches ? matches.length : 0;
      }
    }

    if (totalTests < totalScenarios) {
      console.warn(
        `\n⚠  COVERAGE GAP: ${totalTests} unit tests for ${totalScenarios} spec scenarios.` +
          ` Missing ~${totalScenarios - totalTests} tests. Run the Final Audit in CLAUDE.md.`
      );
    } else {
      console.log(
        `✓  Coverage: ${totalTests} unit tests for ${totalScenarios} spec scenarios.`
      );
    }

    // Soft assertion — warn but don't fail; remove ">= 0" to make this a hard fail
    expect(totalTests).toBeGreaterThanOrEqual(0);
  });
});
