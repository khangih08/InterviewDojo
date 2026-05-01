# InterviewDojo — Agent Skill (English)

What I said earlier

- I created a short todo and added a `.github/skills/SKILL.md` file with guidance. This file is the English version.

Purpose

- Provide concise guidance for GitHub Copilot / agents working on the InterviewDojo repository.

General principles

- Be cautious: only modify files related to the assigned task.
- Keep changes minimal; avoid unnecessary style or structural changes.
- When running commands or tests, describe exact environment steps (frontend/backend).

Useful commands (reference)

- Frontend (Next.js):
  - `cd frontend`
  - `npm install` or `pnpm install`
  - `npm run dev` (start development server)
  - `npm run build` (build production assets)
- Backend (NestJS):
  - `cd backend`
  - `npm install`
  - `npm run start:dev` (start development server)
  - `npm run test` (run tests)
- Local tasks (Windows):
  - Build C++ demo: `g++ -g main.cpp -o main.exe`

Guidance when modifying code

- Add tests when changing important logic.
- Run relevant tests before suggesting a merge.
- If changing project structure, document migration steps in the PR description.

Commit / PR conventions

- Keep titles concise and describe the change (feature/bugfix/refactor).
- Reference issues when applicable (e.g., `Fixes #123`).

When to ask for clarification

- If requirements are unclear, ask for: the goal, affected files, and preferred verification steps.

Notes for agents

- Prioritize small, locally-testable changes.
- If adding files or changing structure, propose migration steps and test plans.

Next steps / optional additions

- If you want, I can extend this file with CI commands, a list of important tests, or a Vietnamese copy alongside the English version.

---

This file is a short guide for agents. Tell me if you want it expanded (CI steps, critical tests, or translation).

CI guidance (GitHub Actions)

- Overview: CI should validate both frontend and backend. Typical CI jobs include: `install`, `lint`, `build`, `test`, and `e2e` (optional).
- Example job commands (run in repository root or job-specific working directories):
  - Frontend (Next.js):
    - `cd frontend`
    - `npm ci`
    - `npm run lint` (if available)
    - `npm run build`
    - `npm run test` (or `npm run test:unit` / `npm run test:ci`)
  - Backend (NestJS):
    - `cd backend`
    - `npm ci`
    - `npm run lint` (if available)
    - `npm run test` (runs Jest unit tests)
- Recommended GitHub Actions steps (high-level):
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` (specify Node.js versions matrix)
  3. Cache dependencies (optional): `actions/cache`
  4. Run frontend job commands
  5. Run backend job commands
  6. Optional: run Playwright e2e job (requires browser dependencies)

Example minimal workflow outline (informational only):

```yaml
name: CI
on: [push, pull_request]
jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
      - run: cd frontend && npm ci
      - run: cd frontend && npm run build
      - run: cd frontend && npm run test --if-present
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "18"
      - run: cd backend && npm ci
      - run: cd backend && npm run test --if-present
```

Important tests and checks (priority list)

- Frontend unit tests:
  - Location: frontend tests and `components/` unit tests run by Vitest or Jest. Ensure `vitest` or `jest` runs succeed.
- Frontend integration / UI tests:
  - Playwright E2E (if present): check `playwright.config.ts` and the `e2e/` or `playwright` test suites.
- Backend unit tests:
  - Location: `backend/test/*.spec.ts` and `backend/src/**/*.spec.ts` (Jest). Run `npm run test` in `backend`.
- Backend integration / API tests:
  - Look for `test/jest-e2e.json` and any e2e specs under `backend/test/` that exercise controllers and services.
- API / contract tests:
  - Files under `tests/` (root `tests/` folder) that exercise the public API (integration or smoke tests).
- Static checks:
  - Linters (`eslint`), TypeScript type checks (`tsc`), and formatting checks (`prettier`) where configured.

Priority for CI failures:

- Failing unit tests (frontend/backend) — immediate fix required.
- Build failures (frontend `npm run build`) — block merge.
- Lint/Type errors — should be fixed before merge.
- Flaky e2e tests — mark as flaky or investigate; don't block small fixes unless reproducible.

Notes

- Adjust Node.js versions and caching to match project conventions. If the repo uses `pnpm` or `yarn`, use the corresponding install commands.
- If you want, I can scaffold a `.github/workflows/ci.yml` file with the example workflow above.
