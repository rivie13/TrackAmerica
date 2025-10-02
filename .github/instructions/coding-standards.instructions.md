---
description: Coding standards for TypeScript / Expo / React Native / Node / Prisma in this repo
applyTo: "**"
---

# Coding Standards — TrackAmerica

These coding standards apply automatically when creating or editing code files. They are pragmatic, opinionated rules tailored to this TypeScript + Expo (React Native) + Node + Prisma project.

## Formatting & Linting
- Use Prettier for formatting and ESLint (with `typescript-eslint`) for linting.
- Preferred configs:
  - `prettier` with defaults (single source of truth for formatting)
  - `eslint` + `@typescript-eslint/recommended` + React Native plugin when applicable
- Run linters and formatters before opening a PR.
- Keep `eslint` warnings low; prefer `error` for real issues and `warn` for softer guidance.

## TypeScript
- Use strict typing where practical. Prefer `unknown` over `any` and avoid implicit `any`.
- Export shared types from `lib/types.ts` and import them across front/back boundaries.
- Add JSDoc comments on public functions and complex modules.
- Prefer returning typed DTO objects from API functions (e.g., `Promise<Representative[]>`).

## React / React Native (Expo)
- Keep components small and single-responsibility. One component === one responsibility.
- Use functional components with hooks. Prefer `useEffect`, `useMemo`, `useCallback` where appropriate to avoid unnecessary re-renders.
- Style with NativeWind/Tailwind classes. Avoid large inline style objects unless dynamic styles are required.
- Accessibility: add basic accessibility props (`accessibilityLabel`, `accessible`, etc.) for interactive elements.
- Keep platform-specific code minimal; use `Platform.OS` only when necessary.

## API & Backend (Node + Express)
- Keep controllers thin: validate input → call service → return response.
- Use Prisma client for DB access; centralize DB calls under a `services/` or `lib/db.ts` layer.
- Do not leak raw DB errors to clients. Log errors server-side and return sanitized messages.
- Apply caching-check-then-fetch pattern: check DB first, then call Congress.gov API and persist results.

## Prisma & Database
- Keep schema models simple and descriptive (see `IMPLEMENTATION_PLAN.md`).
- Use `npx prisma migrate dev` for local migrations. Run `npx prisma generate` after schema changes.
- Use `pgvector` type for embeddings where relevant (`BillChunk.embedding`).

## Tests
- Add unit tests for critical logic (parsing, embedding creation, RAG retrieval) where feasible.
- Use small, fast tests. Prefer mocking external APIs.

## Naming & Style
- Use camelCase for variables and functions; PascalCase for React components and types/interfaces.
- File names: use kebab-case for components and utility files (e.g., `rep-card.tsx`, `api-client.ts`).
- Keep exports explicit; prefer named exports for shared utilities.

## Error Handling
- Validate and sanitize inputs early. Return 4xx for client errors, 5xx for server errors.
- Use a consistent error shape for API responses: `{ error: { message: string, code?: string } }`.

## Small-Change Rule (Enforced)
- For every PR, aim to change as little as possible. Large refactors should be split into multiple PRs with a clear migration path.

## When to ask the owner
- If a change requires adopting a new major dependency or modifying core project conventions (linters, build scripts), ask before proceeding.
- If a refactor touches many files (> 5) ask whether to proceed or split into steps.

## Quick checklist for PRs
- [ ] Linted (ESLint) and formatted (Prettier)
- [ ] Type-checks pass (TypeScript)
- [ ] Small, focused commits with Conventional Commit-style messages
- [ ] PR description contains manual test steps

**Notes:** These are practical defaults. If you want stricter rules (strict boolean flags, specific ESLint rules listed), tell me which level of strictness you prefer and I will codify them into `eslint`/`prettier` configs and update these instructions.
