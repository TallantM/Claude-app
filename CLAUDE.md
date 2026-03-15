# sdlc-hub — SDD Experiment Project

## Behavior Directive
Do NOT ask for confirmation before editing files, running tests, installing packages, or making commits. Proceed autonomously. Only pause for destructive/remote actions: force-push, DB reset, deleting branches, or anything affecting shared remote state.

---

## What This Project Is

**sdlc-hub** is a Software Development Lifecycle management platform (Next.js 14, TypeScript, Prisma/SQLite, NextAuth v4).

This repo is used to run **controlled SDD (Spec-Driven Development) experiments** — each "run" generates specs + tests using AI agents, then measures quality metrics.

---

## Current State: Run-6 Ready

5 runs complete. Run-6 is next.

| Run | Branch | Unit | Conformance | E2E (post-fix) | E2E (first-pass) | Notes |
|-----|--------|------|-------------|----------------|-------------------|-------|
| 1 | `qa` | 34/34 | 5/5 | 37/37 (100%) | — | 4/11 features |
| 2 | `experiment/run-2` | 102/102 | 44/44 | 35/53 (66%) | — | 11/11 features |
| 3 | `experiment/run-3` | 108/108 | 57/57 | 52/56 (93%) | — | 7 app bugs found |
| 4 | `experiment/run-4` | 95/95 | 61/61 | 54/72 (75%) | 49/72 (68%) | 7 bugs confirmed again |
| 5 | `experiment/run-5` | 144/144 | 61/61 | 64/69 (93%) | 52/69 (75%) | All bugs fixed; 3-tier arch |

Post-mortems: `docs/experiment-run-{N}-postmortem.md`

### Run-6 Goals
- Add patterns 14–18 to `sdd-framework/stacks/nextjs-vitest-playwright.md` (pre-flight)
- Investigate 2 remaining failures: `projects.spec.ts` create-dialog not closing after submission
- Target: **100% first-pass** (18 patterns pre-baked)

### Branch Convention
```bash
git checkout main
git checkout -b experiment/run-6
```

---

## Three-Tier Framework Architecture

| Tier | File | Purpose |
|------|------|---------|
| 1 — Core | `sdd-framework/docs/agent-patterns.md` | Agent prompts, framework process — zero tech references |
| 2 — Stack | `sdd-framework/stacks/nextjs-vitest-playwright.md` | 13+ reusable patterns for Next.js + Vitest + Playwright |
| 3 — Project | `docs/sdd-project-patterns.md` | sdlc-hub specifics: testids, credentials, routes |

**When generating tests, the code-gen agent reads all three tiers.**

---

## Running Tests

```bash
# Seed database first (required before E2E)
npm run db:seed

# Unit tests
npm test

# Conformance tests (separate config — node environment)
npm run test:conformance

# E2E tests — REQUIRES dev server running in a separate terminal
# Terminal 1:
npm run dev
# Terminal 2:
npm run test:e2e
```

---

## App Overview

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router |
| Language | TypeScript 5 |
| UI | React 18, Radix UI, Tailwind CSS, shadcn/ui |
| Auth | NextAuth v4 (credentials + OAuth), login at `/login` |
| Database | Prisma ORM + SQLite (`prisma/dev.db`) |
| Forms | React Hook Form + Zod |
| Test: Unit | Vitest + React Testing Library |
| Test: E2E | Playwright |

### Key Routes
| Route | Description |
|-------|-------------|
| `/login` | Login (NOT `/api/auth/signin`) |
| `/register` | Registration |
| `/dashboard` | Stats, activity feed |
| `/projects` | Project list |
| `/projects/[id]` | Kanban board (spec name: `project-detail`) |
| `/issues` | Issue tracker |
| `/pipelines` | CI/CD pipelines |
| `/team` | Team members |
| `/notifications` | Notifications |
| `/repos` | Git repos |
| `/settings` | User settings |
| `/reports` | Analytics |

Route group `src/app/(app)/` — `(app)` is NOT part of the URL.

### Test Credentials
| Account | Email | Password |
|---------|-------|----------|
| Tester | `tester@sdlchub.com` | `test1234` |
| Admin | `admin@sdlchub.com` | `admin123` |

### Key Source Files
| Path | Contents |
|------|----------|
| `src/app/` | Pages and API routes |
| `src/components/` | UI components |
| `src/lib/auth.ts` | NextAuth config |
| `src/lib/validations.ts` | Zod schemas |
| `prisma/schema.prisma` | DB schema |
| `specs/features/` | SDD spec files (4 per feature) |
| `tests/unit/` | Vitest unit tests |
| `tests/e2e/` | Playwright E2E tests |
| `tests/conformance/` | Spec-code alignment tests |
| `docs/sdd-project-patterns.md` | Tier 3 patterns (testids, routes, known pitfalls) |
