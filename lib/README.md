# lib/ Directory

This directory contains **shared utilities and types** used across the **frontend only**.

## Structure

```
lib/
├── types.ts          # Shared TypeScript types and interfaces
└── api-client.ts     # Helper functions to call our backend API (planned)
```

## Purpose

### types.ts
- Shared TypeScript interfaces and types
- Data models for Representatives, Bills, Votes, etc
- Ensures type consistency across frontend and backend
- Used by both frontend components and backend API

### api-client.ts (planned)
- Helper functions to call **OUR backend API** at `localhost:3000/api/*`
- Example: `fetchRepsByState(code)` → calls `GET /api/representatives/:state`
- NO direct calls to Congress.gov or Azure OpenAI (that's backend's job)
- Just thin wrappers around `fetch()` for type safety

## Important: Frontend vs Backend

**Frontend (lib/):**
- ✅ Shared types
- ✅ Helper functions to call OUR backend API
- ❌ NO direct calls to Congress.gov
- ❌ NO direct calls to Azure OpenAI
- ❌ NO database access

**Backend (api/):**
- ✅ Calls Congress.gov API
- ✅ Calls Azure OpenAI API
- ✅ Database access with Prisma
- ✅ All business logic and external integrations

**The frontend only talks to the backend. The backend talks to everything else.**

## Best Practices

1. **Keep it simple** - lib/ is for shared types and thin API client helpers only
2. **No business logic** - Complex logic belongs in backend `api/` or frontend components
3. **Type everything** - Use TypeScript strict mode for all exports
4. **No external API calls** - Frontend never calls Congress.gov or Azure directly
5. **Backend does the work** - All external integrations happen in `api/` backend

## Example Usage

```typescript
// Import shared types
import { Representative, Bill } from '@/lib/types';

// Import API client helper (when we build it)
import { fetchRepsByState } from '@/lib/api-client';

// This calls OUR backend at GET /api/representatives/CA
const reps = await fetchRepsByState('CA');
```
