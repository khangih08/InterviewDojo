# Tests — Important Suites

This file lists the most important test suites and where to run them.

## Frontend

- Unit tests: run in `frontend` using Vitest or Jest.
  - Command: `cd frontend && npm run test`
- Integration/UI tests: Playwright E2E (if present).
  - Check `playwright.config.ts` and run `npx playwright test` from repo root or `cd frontend`.

## Backend

- Unit tests: run in `backend` (Jest).
  - Command: `cd backend && npm run test`
- Integration / e2e: check `backend/test/` for e2e specs and `jest-e2e.json`.

## Root-level tests / smoke tests

- Root `tests/` folder may contain integration or API-level tests. Run with the configured test runner.

## Static checks

- ESLint and TypeScript type checks: run in both `frontend` and `backend` where configured.

## Prioritization for CI

1. Unit tests (frontend & backend)
2. Build (frontend) and compile/type checks
3. Linting
4. E2E (run separately or nightly if slow)

If you want, I can also add GitHub Action jobs specifically to run these test groups.
