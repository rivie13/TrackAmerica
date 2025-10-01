<!--
Guidance for AI coding agents (Copilot / coding agents) working on TrackAmerica repo.
Keep this file short (20-50 lines) and focused on project-specific patterns, workflows, and
integration points that help an automated agent be productive immediately.
-->

# Copilot instructions — TrackAmerica

Purpose: help an AI coding agent make safe, useful changes by documenting the repo's
architecture, local workflows, important files, and conventions.

- Big picture
  - Mono-repo for an Expo React Native app (web + mobile) and a small Express API.
  - Frontend uses Expo + Expo Router in `app/` (pages) with components in `components/`.
  - Backend API is expected under an `api/` folder (Express + TypeScript + Prisma).
  - Postgres + pgvector (Prisma) is the canonical data store; Azure OpenAI is used for embeddings/chat.

- Where to look (examples)
  - `IMPLEMENTATION_PLAN.md` — authoritative project plan, dev commands, DB schema examples.
  - `TECH_STACK.md` — technologies, env var names, and deployment targets.
  - `app/` — Expo Router pages (home `index.tsx`, `state/[code].tsx`, `_layout.tsx`).
  - `components/USAMap.tsx`, `components/RepCard.tsx`, `components/ChatBot.tsx` — expected components.
  - `api/` — Express server; watch for `GET /api/representatives/:state`, `/api/bills/:billId`, `/api/chat`.
  - `prisma/schema.prisma` — data models (Representative, Bill, Vote, BillChunk).

- Development & build commands (use these exact or verify first)
  - Frontend: run in repo root (project name `trackamerica`): `npm start`, `npm run web`, `npm run ios`, `npm run android`.
  - Backend: `cd api && npm run dev` (nodemon). Use Postman or curl to test endpoints.
  - Database: uses Prisma; commands: `npx prisma migrate dev`, `npx prisma generate`, `npx prisma studio`.

- Environment variables (refer to `TECH_STACK.md`) — agent may need to read/update `.env` templates
  - CONGRESS_API_KEY, DATABASE_URL, AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT_NAME, AZURE_OPENAI_EMBEDDING_DEPLOYMENT, PORT, NODE_ENV

- Code & design conventions
  - TypeScript throughout. Prefer adding small, typed changes and export/import shared types in `lib/types.ts`.
  - Keep components small and single-purpose (see Implementation Plan examples).
  - Use console logging for debugging in early feature work; add proper error handling when stabilizing.
  - For API code: prefer caching-check-then-fetch pattern: check DB (Prisma) ➜ if missing call Congress.gov ➜ persist ➜ return.
  - Embeddings workflow: chunk bill text (~500 words), call Azure embedding deployment, store vector in `BillChunk.embedding` (pgvector).

- Safety & CI expectations
  - Don't add secrets to code. Use `.env` or Azure Key Vault in deployment — never commit real API keys.
  - Keep PRs small and focused (single feature/fix). Add or update `IMPLEMENTATION_PLAN.md` only when changing high-level scheduling.

- When editing files, prefer minimal, well-scoped changes:
  - Update `README.md`/docs when adding new top-level scripts or significant architecture changes.
  - If creating new API endpoints, add matching example curl commands in `IMPLEMENTATION_PLAN.md` (for maintainers/tests).

- When unsure
  - Read `IMPLEMENTATION_PLAN.md` and `TECH_STACK.md` first — they are the single source of project intent.
  - If package scripts or exact file locations are missing, ask the maintainer instead of guessing.

Please review and tell me if you want more examples (e.g., exact HTTP shapes, Prisma model fields, or sample API clients).
