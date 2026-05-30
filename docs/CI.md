# CI Guidance


This documents describes recommended CI checks for InterviewDojo.

## High-level jobs

- `install` (frontend & backend)
- `lint` (ESLint, TypeScript)
- `build` (frontend `npm run build`)
- `test` (unit tests for backend/frontend)
- `e2e` (Playwright or other end-to-end tests) — optional and slower

## Example steps for GitHub Actions

- `actions/checkout@v4`
- `actions/setup-node@v4` (specify Node.js version matrix)
- Cache dependencies with `actions/cache`
- Run frontend install/build/test
- Run backend install/test
- Optionally run Playwright e2e on a separate job with required browser packages

## Notes

- Use `npm ci` in CI for reproducible installs.
- Cache `node_modules` or package manager store to speed up CI.
- Keep Node.js version(s) in sync with local dev recommendations.
- If using `pnpm` or `yarn`, adjust install/cache steps accordingly.

If you want, I can scaffold `.github/workflows/ci.yml` with these jobs.
