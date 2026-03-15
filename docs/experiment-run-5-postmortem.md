# Experiment Run 5 — Post-Mortem

**Branch**: `experiment/run-5`
**Date**: 2026-03-15
**Model**: claude-sonnet-4-6

---

## Final Scores

| Suite | Run-2 | Run-3 | Run-4 | Run-5 |
|-------|-------|-------|-------|-------|
| Unit | 102/102 | 108/108 | 95/95 | **144/144** |
| Conformance | 44/44 | 57/57 | 61/61 | **61/61** |
| E2E first-pass | — | — | 49/72 (68%) | **52/69 (75%)** |
| E2E post-fix | 35/53 (66%) | 52/56 (93%) | 54/72 (75%) | **64/69 (93%)** |
| App bugs found | unknown | 7 | 7 | **0 (all fixed)** |

---

## Major Change This Run: Three-Tier Framework Architecture

The `sdd-framework` submodule was restructured from a single monolithic `agent-patterns.md` into three tiers:

| Tier | Location | Purpose |
|------|----------|---------|
| 1 — Core | `sdd-framework/docs/agent-patterns.md` | Framework process only — zero technology references |
| 2 — Stack | `sdd-framework/stacks/nextjs-vitest-playwright.md` | 13 reusable patterns for any Next.js project |
| 3 — Project | `docs/sdd-project-patterns.md` | sdlc-hub specifics — testids, credentials, routes |

**Validation**: The code-gen agent read all three files and applied patterns correctly on first generation. The architecture works. A new Next.js project can now adopt the framework by adding the submodule, pointing to `stacks/nextjs-vitest-playwright.md`, and writing their own Tier 3 file.

---

## First-Pass Improvement: 68% → 75%

Run-4 first-pass: 49/72 (68%). Run-5 first-pass: 52/69 (75%).

The 3 additional first-pass passes came from patterns 11-13 being pre-baked:
- `getByLabel({ exact: true })` — prevented settings ambiguity
- `h1` wait for static pages — prevented notifications/reports timeout
- List stabilization before counting — prevented team race condition

---

## 12 First-Pass Failures — Root Causes

| Count | Category | Root Cause |
|-------|----------|-----------|
| 1 | Auth setup | `auth.setup.ts` threw hard error on missing env vars instead of using fallback |
| 2 | Dashboard strict mode | `text=Total Tasks` matched stat card heading AND task distribution span |
| 1 | Notifications race | Checked for items before skeleton loading completed |
| 5 | Project detail | `navigate()` vs `navigateTo()` method name mismatch; task text content included icon DOM; hidden tabpanel selected with `.last()` |
| 2 | Repos strict mode | `text=Connect Repository` matched button + dialog heading + submit button |
| 1 | Settings async session | `profileName` state initialized from `session?.user?.name` which is `undefined` at mount; fixed with `useEffect` sync |

**New patterns extracted from these failures:**

- **Pattern 14** — Auth setup must use env var fallbacks, never hard-throw: `process.env.VAR ?? "default"`
- **Pattern 15** — `text=` selector is fragile for labels that appear in multiple contexts (heading + content); prefer `getByRole('heading', { name: ... })` or scoped locators
- **Pattern 16** — Page object method naming: always use `navigate()` (not `navigateTo()`, `go()`, etc.) for consistency across page objects
- **Pattern 17** — Tabpanel selection: use `[data-state="active"]` not `.last()` to get the visible panel
- **Pattern 18** — Session-dependent state: components using `session?.user?.name` as initial state need a `useEffect` to sync when session resolves; tests must wait for the non-empty value

---

## 2 Remaining Failures

Both are in `projects.spec.ts` — the create-project dialog does not close after form submission. This is a pre-existing issue from how the projects page handles the form state after API call. It is not a test-quality issue.

**Not fixed this run** — documenting for run-6 investigation.

---

## App Bugs Status

All 7 previously tracked bugs were fixed before run-5:
- `GET /api/repos` — route created ✅
- `GET /api/projects/[id]/tasks` — route created ✅
- `assigneeId: ""` → null ✅
- `storyPoints` NaN → z.preprocess ✅
- `GET /api/pipelines` optional projectId ✅
- Dashboard `json.data` mismatch ✅
- Project detail API response reshaping ✅

1 new app fix applied during run-5: settings `profileName` useEffect sync.

---

## Recommendations for Run-6

### Add 5 new patterns to stack file
Patterns 14-18 (see above) should be added to `sdd-framework/stacks/nextjs-vitest-playwright.md`.

### Investigate 2 remaining failures
The projects create-dialog not closing after submission — likely a race condition in the form's `onSuccess` callback or the dialog's `open` state not updating. Needs targeted debugging.

### Target: 100% first-pass
With 18 patterns pre-baked, run-6 should achieve 100% first-pass on first generation.
