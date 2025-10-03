# Commit Message Guidelines

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to keep commit history clean and consistent.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (Required)

Must be one of:

- **feat**: New feature for the user
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semicolons, no code change)
- **refactor**: Code refactoring (no feature add or bug fix)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks (dependencies, build, etc.)
- **ci**: CI/CD pipeline changes
- **revert**: Revert a previous commit

### Scope (Optional)

The scope provides additional context (e.g., `feat(map):`, `fix(api):`).

Examples:
- `map`, `api`, `ui`, `auth`, `db`, `routes`

### Subject (Required)

- Short description (max 100 characters total for `type(scope): subject`)
- **Must be all lowercase** - no uppercase letters allowed
- **No punctuation** - no periods, commas, apostrophes, or special characters
- No period at end
- Imperative mood ("add" not "added" or "adds")
- Use hyphens instead of spaces in multi-word terms (e.g., "congress-api" not "Congress.gov API")

### Body (Optional)

- Explain *what* and *why* (not *how*)
- Separate from subject with blank line
- Wrap at 72 characters

### Footer (Optional)

- Reference issues: `Closes #123`
- Breaking changes: `BREAKING CHANGE: explanation`

## Examples

### Good Commits ✅

```
feat(map): add clickable state functionality

Users can now click on any state in the USA map to view representatives.
Uses react-native-svg for rendering and touch handling.

Closes #42
```

```
fix(api): handle rate limiting for congress api

Added exponential backoff when hitting rate limits (5000 req/hour).
Requests now retry up to 3 times with increasing delays.
```

```
docs: update readme with setup instructions
```

```
chore: upgrade expo to v54
```

### Bad Commits ❌

```
Added new feature
(Missing type, not imperative, vague)
```

```
fix: Fixed bug
(Capital F in "Fixed", should be all lowercase)
```

```
FEAT: Add Map Component
(Type and subject should be lowercase)
```

```
feat(map): Added clickable states.
(Capital A in "Added", ends with period, not imperative)
```

```
fix(api): handle Congress.gov API errors
(Capital C, contains periods - must be all lowercase with no punctuation)
```

```
feat: add user's profile page
(Contains apostrophe - not allowed, use "add user profile page")
```

## Git Hooks

This project uses [Husky](https://typicode.github.io/husky/) to enforce quality standards:

### Pre-commit Hook
Runs before every commit:
- ✅ ESLint (code quality)
- ✅ Prettier (code formatting)
- ✅ TypeScript (type checking)

If any check fails, the commit is blocked.

### Commit-msg Hook
Validates commit message format using [Commitlint](https://commitlint.js.org/).

If your commit message doesn't follow Conventional Commits, it will be rejected.

## Bypassing Hooks (Not Recommended)

In rare cases, you can skip hooks:
```bash
git commit --no-verify -m "emergency fix"
```

**Only use this for emergencies!** Skipped checks may break CI/CD.

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Commitlint](https://commitlint.js.org/)
- [Husky](https://typicode.github.io/husky/)
