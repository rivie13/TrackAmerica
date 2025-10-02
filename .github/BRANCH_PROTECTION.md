# Branch Protection Rules

This document describes the recommended branch protection rules for the TrackAmerica repository.

## Protected Branches

### `main` (Production)

**Required Status Checks:**
- ✅ `lint-and-typecheck` - Must pass ESLint, Prettier, and TypeScript checks
- ✅ `build` - Must successfully build the project

**Rules:**
- ✅ Require pull request before merging
- ✅ Require approvals: 1 reviewer minimum
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Require conversation resolution before merging
- ❌ Allow force pushes: Disabled
- ❌ Allow deletions: Disabled

### `dev` (Integration)

**Required Status Checks:**
- ✅ `lint-and-typecheck` - Must pass ESLint, Prettier, and TypeScript checks
- ✅ `build` - Must successfully build the project

**Rules:**
- ✅ Require pull request before merging
- ✅ Require status checks to pass before merging
- ⚠️ Require approvals: Optional (can be 0 for solo development)
- ❌ Allow force pushes: Disabled
- ❌ Allow deletions: Disabled

## How to Configure Branch Protection (GitHub UI)

### For Repository Owner

1. Go to **Settings** → **Branches** in your GitHub repository
2. Click **Add branch protection rule**
3. Enter branch name pattern: `main`
4. Configure settings as described above
5. Click **Create** or **Save changes**
6. Repeat for `dev` branch

### Specific Settings

#### Require pull request before merging
- Protects against direct commits to `main`/`dev`
- Forces code review workflow

#### Require status checks to pass
- Wait for CI/CD pipeline to succeed before merge
- Ensures code quality gates are met
- Status checks to require:
  - `lint-and-typecheck / Lint and Type Check`
  - `build / Build Check`

#### Require branches to be up to date
- Forces feature branches to be rebased on latest `main`/`dev`
- Prevents merge conflicts and integration issues

#### Require conversation resolution
- All PR comments must be resolved before merge
- Ensures feedback is addressed

## Feature Branch Workflow

```
main (protected)
  ↑
  └── dev (protected)
        ↑
        └── feature/your-feature (unprotected)
```

**Workflow:**
1. Create feature branch from `dev`: `git checkout -b feature/new-feature`
2. Make changes and commit (Husky runs pre-commit hooks)
3. Push to GitHub: `git push origin feature/new-feature`
4. Open PR to `dev` (CI runs automatically)
5. Wait for CI to pass ✅
6. Get code review approval
7. Merge to `dev`
8. When ready for production, PR from `dev` → `main`

## CI/CD Pipeline

The `.github/workflows/ci.yml` file defines our continuous integration pipeline:

### Triggers
- Pull requests to `main` or `dev`
- Direct pushes to `main` or `dev` (if allowed)

### Jobs

**1. lint-and-typecheck**
- Runs ESLint for code quality
- Checks Prettier formatting
- Runs TypeScript type checker
- Fast feedback (usually < 1 minute)

**2. build**
- Runs only if lint-and-typecheck passes
- Attempts to build Expo web export
- Catches build-time errors
- Takes longer (2-5 minutes)

### Status Badges

Add to README.md:
```markdown
![CI](https://github.com/rivie13/TrackAmerica/actions/workflows/ci.yml/badge.svg)
```

## Bypassing Protection (Emergency Only)

**Admin users can:**
- Force push to protected branches
- Merge without PR review
- Bypass status checks

**Only use in emergencies:**
- Critical security patches
- Production hotfixes that can't wait for review

**After emergency bypass:**
- Create follow-up PR documenting changes
- Update team on what was changed and why

## Local Development

Before pushing, run locally:
```bash
npm run lint        # Check code quality
npm run format:check # Check formatting
npm run type-check  # Check TypeScript
```

Husky pre-commit hooks run these automatically on commit.

## References

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
