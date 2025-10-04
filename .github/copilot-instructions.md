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
  - Frontend uses Expo + Expo Router with file-based routing in `app/` directory.
  - Components organized by feature domain in `components/` (ui, map, representatives, chat).
  - Backend API under `api/` folder (Express + TypeScript + Prisma).
  - Postgres + pgvector (Prisma) is the canonical data store; Azure OpenAI for embeddings/chat.

- Where to look (examples)
  - `IMPLEMENTATION_PLAN.md` — authoritative project plan, dev commands, DB schema examples.
  - `TECH_STACK.md` — technologies, env var names, and deployment targets.
  - `app/README.md` — route groups, navigation patterns, file-based routing explained.
  - `app/(tabs)/index.tsx` — home screen (URL: `/`).
  - `app/(states)/[code].tsx` — dynamic state detail page (URL: `/california`, `/texas`).
  - `components/README.md` — component organization (ui, map, representatives, chat).
  - `components/ui/` — generic UI components (PageTitle, Subtitle, StatusCard).
  - `components/map/USAMap.tsx` — interactive USA map (planned).
  - `components/representatives/RepCard.tsx` — representative card (planned).
  - `lib/README.md` — utilities, API clients, shared types documentation.
  - `lib/types.ts` — shared TypeScript interfaces.
  - `lib/api-client.ts` — helper functions to call backend API (planned).
  - `api/` — Express server; watch for `GET /api/representatives/:state`, `/api/bills/:billId`, `/api/chat`.
  - `prisma/schema.prisma` — data models (Representative, Bill, Vote, BillChunk).

- Route groups (important!)
  - `app/(tabs)/` — main navigation group (URL: `/`, not `/tabs/`)
  - `app/(states)/` — state detail pages (URL: `/california`, not `/states/california`)
  - Parentheses `()` in folder names = route group (organization without URL impact)
  - Each group has `_layout.tsx` defining navigation structure (Stack, Tabs, etc)

- Development & build commands (use these exact or verify first)
  - Frontend: run in repo root (project name `trackamerica`): `npm start`, `npm run web`, `npm run ios`, `npm run android`.
  - Backend: `cd api && npm run dev` (nodemon). Use Postman or curl to test endpoints.
  - Database: uses Prisma; commands: `npx prisma migrate dev`, `npx prisma generate`, `npx prisma studio`.

- Environment variables (refer to `TECH_STACK.md`) — agent may need to read/update `.env` templates
  - CONGRESS_API_KEY, DATABASE_URL, AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT_NAME, AZURE_OPENAI_EMBEDDING_DEPLOYMENT, PORT, NODE_ENV

- Code & design conventions
  - TypeScript throughout. Prefer adding small, typed changes and export/import shared types in `lib/types.ts`.
  - Keep components small and single-purpose (one component = one responsibility).
  - Organize components by feature domain (ui, map, representatives, chat), not by type.
  - Use route groups `(group)` to organize pages without affecting URLs.
  - Use NativeWind for styling: `className` with Tailwind utilities (not StyleSheet).
  - Export components from feature barrel exports (`components/ui/index.ts`) and main barrel (`components/index.ts`).
  - Use console logging for debugging in early feature work; add proper error handling when stabilizing.
  - **Frontend (`lib/`) only calls OUR backend API** — no direct Congress.gov or Azure calls from frontend.
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
