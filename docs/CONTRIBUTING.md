# Contributing to InterviewDojo

Thank you for contributing! This document summarizes conventions and workflows to make contributions smooth.

## Branches & PRs

- Create feature branches from `main` (or the repo default branch): `feature/xxx` or `fix/xxx`.
- Keep PRs small and focused. Describe the change and include steps to verify.
- Reference issues in PR description (e.g., `Fixes #123`).

## Commit messages

- Keep the title concise (max ~72 chars).
- Use present tense: `Add`, `Fix`, `Refactor`.
- Provide a short body if needed to explain why.

## Tests & Quality

- Add unit tests for new features and bug fixes.
- Run linters and type checks locally before PR.
- Update or add docs in `docs/` for public-facing changes.

## Review checklist

- Tests added / updated for changed behavior
- Linting and type checks pass
- No sensitive data in commits
- Documentation updated if public behaviour changed

## CI

PRs should pass CI (unit tests, build). If CI fails due to flaky tests, mark the test as flaky and add a follow-up issue.
