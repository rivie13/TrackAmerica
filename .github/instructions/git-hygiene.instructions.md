---
description: Git branching, commit, and PR conventions for TrackAmerica
applyTo: "**"
---

# Git Hygiene & Branching Conventions

This file describes the project's lightweight Git workflow and commit/PR conventions. It applies automatically when creating or editing code files.

## Branching model
- `main` (protected): production-ready code only. Merge only via pull request after review and passing CI.
- `dev` (integration): the default integration branch for ongoing work and testing. Feature branches branch from `dev` and are merged back into `dev`.
- `feature/*`: short-lived branches for new features. Branch from `dev` and name like `feature/add-chatbot-ui`.
- `fix/*` or `bugfix/*`: branches for bug fixes. Branch from `dev` and name like `fix/map-click-error`.
- `hotfix/*`: emergency fixes branched from `main`; merge back into both `main` (last) and `dev` (first) after completion.

## Branch naming
- Use hyphen-separated lowercase names and prefixes: `feature/`, `fix/`, `hotfix/`.
- Keep names short and descriptive: `feature/us-map-click` or `fix/api-rate-limit`.

## Pull requests
- Open PRs from feature/fix branches into `dev` (unless hotfix → `main`).
- PR title should be concise and match Conventional Commit (see below), e.g., `feat(map): add clickable states`.
- Provide a short description of the change and any manual test steps.
- Keep PRs small and focused (prefer < 300 lines changed). If larger, split into logical commits or multiple PRs.
- Require at least one reviewer before merging.
- Squash or rebase merges per repository settings; maintain readable history.

## Commit messages (Conventional Commits)
- Use Conventional Commits format: `<type>(scope?): short description`.
  - Examples: `feat(map): add clickable states`, `fix(api): handle rate limit errors`, `docs: update README`.
- Common types: `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`.
- For breaking changes include `!` or `BREAKING CHANGE:` in the footer.

## PR checks & protection
- `main` must be protected (require PR & passing CI before merge).
- Ensure linters (`eslint`/`typescript`), formatters (`prettier`), and tests (if any) run in CI for PRs.

## Good practices
- Rebase feature branches on `dev` before opening PRs to reduce merge conflicts.
- Make small commits with clear messages (use Conventional Commit types).
- Avoid committing secrets (use `.env` and secret stores).
- Use draft PRs for work in progress; request reviews when ready.

## When to ask the owner
- If a requested change touches multiple features or seems large, ask whether to split into multiple PRs.
- If you're unsure whether a change should go to `dev` or `main`, ask before merging.

**Remember:** small, focused PRs are easier to review and safer to land.
