# TrackAmerica.com - Tech Stack

**Last Updated:** March 16, 2026
**Philosophy:** Keep It Simple, Stupid (KISS)
**Focus:** Federal level only (state/local later)

---

## Project Goal

Build an **all-in-one national dashboard** (web + mobile) that shows:

1. National indicators — gas prices, dollar value, interest rates, national debt, approval ratings
2. Interactive USA map — click a state to see its representatives
3. Federal representatives by state — senators and house members
4. How representatives voted on bills
5. AI Q&A to answer questions about bills

---

## 📱 Frontend (Universal - Web + Mobile)

| Technology | Purpose | Why |
|------------|---------|-----|
| **Expo** | React Native framework | One codebase for web + iOS + Android |
| **Expo Router** | File-based routing | Simple navigation like Next.js |
| **React Native** | UI components | Cross-platform components |
| **React Native Web** | Web support | Automatically included with Expo |
| **NativeWind** | Styling | Tailwind CSS for React Native |
| **TypeScript** | Language | Type safety, better DX |
| **@tanstack/react-query** | Data fetching | Caching, loading states, refetching for all API calls |
| **AsyncStorage** | Local storage | Save user preferences on device |

### Map Solution
- `react-native-svg` + TopoJSON USA map (implemented, working)
---

## ⚙️ Backend API

| Technology | Purpose | Why |
|------------|---------|-----|
| **Node.js** | Runtime | JavaScript everywhere |
| **Express.js** | API server | Simple, battle-tested |
| **TypeScript** | Language | Type safety, shared types with frontend |
| **Prisma** | ORM | Type-safe database access |
| **Axios** | HTTP client | Call Congress.gov API |
| **express-rate-limit** | Rate limiting | Protect API from abuse |
| **dotenv** | Environment variables | Manage secrets |

---

## 🗄️ Database

| Technology | Purpose | Why |
|------------|---------|-----|
| **PostgreSQL** | Main database | Reliable, scalable |
| **pgvector** | Vector embeddings | AI semantic search for bills |
| **Prisma** | Database client | Type-safe queries |

### Database Tables
```
- representatives (senators + house members)
- bills (metadata: number, title, date, sponsor)
- votes (who voted what on which bill)
- bill_chunks (bill text split into searchable pieces)
- bill_embeddings (vector embeddings for AI search)
```

---

## 🤖 AI Services

| Technology | Purpose | Why |
|------------|---------|-----|
| **Azure OpenAI** | AI chatbot | GPT-4o for answering questions | [TBD what model will be used] |
| **text-embedding-ada-002** | Embeddings | Convert bill text to vectors |

---

## External APIs

| API | Purpose | Cost |
|-----|---------|------|
| **Congress.gov API** | Get representatives, bills, votes | FREE (5,000 req/hour) |
| **EIA API** | Gas/energy prices (national avg) | FREE (api.eia.gov) |
| **FRED API** | Dollar index, interest rates, economic data | FREE (fred.stlouisfed.org) |
| **Treasury FiscalData API** | National debt data | FREE, no key needed (fiscaldata.treasury.gov) |
| **Approval ratings** | Congress/President/SCOTUS approval | TBD — RealClearPolitics/Gallup (may need scraping or static data) |

**Congress.gov Endpoints Used:**
- `/member/{stateCode}` - Get representatives by state
- `/bill/{congress}/{billType}/{billNumber}` - Get bill details
- `/house-vote/{congress}/{session}/{voteNumber}/members` - House votes
- Bill text and summaries

**National Dashboard Data Points:**
- Avg gas price — trends over 3/6/9/12 months
- US Dollar valuation (DXY) — trends over 1/5/10 years
- Treasury bond interest rates — trends over 6mo/1/3/5 years
- National debt — rate of increase over 1/5/10/20 years
- Congress/President/Supreme Court approval — trends over 6mo/1/3/5 years

---

## ☁️ Deployment (Production)

| Service | Purpose | Estimated Cost |
|---------|---------|----------------|
| **Azure App Service** | Host web app + API | ~$50-100/month |
| **Azure Database for PostgreSQL** | Managed PostgreSQL with pgvector | ~$50-100/month |
| **Azure OpenAI Service** | AI chatbot | Pay-per-use (~$50-100/month) |
| **Domain (trackamerica.com)** | Custom domain | ~$12/year |
| **Apple App Store** | iOS app distribution | $99/year |
| **Google Play Store** | Android app distribution | $25 one-time |

**Total:** ~$150-300/month in production + ~$136/year for stores/domain

---

## 🛠️ Development Tools

| Tool | Purpose |
|------|---------|
| **VS Code** | Code editor |
| **Git + GitHub** | Version control |
| **Docker** | Local PostgreSQL (optional) |
| **Expo Go** | Test on phone without building |
| **Postman/Thunder Client** | API testing |

---

## 🚫 What We're NOT Using (Keep It Simple!)

- ❌ **No authentication** (add later if needed)
- ❌ **No Redis** (PostgreSQL is fast enough)
- ❌ **No separate vector DB** (using pgvector in PostgreSQL)
- ❌ **No complex state management** (React Context is enough)
- ❌ **No GraphQL** (REST API is simpler)
- ❌ **No microservices** (monolith is fine for MVP)
- ❌ **No CDN** (add later if needed)
- ❌ **No monitoring tools** (add later when in production)

---

## 📦 Key NPM Packages

### Frontend (Expo)
```json
{
  "expo": "latest",
  "expo-router": "latest",
  "react-native": "latest",
  "nativewind": "latest",
  "react-native-svg": "latest",
  "@react-native-async-storage/async-storage": "latest"
}
```

### Backend (Node.js)
```json
{
  "express": "latest",
  "prisma": "latest",
  "@prisma/client": "latest",
  "axios": "latest",
  "express-rate-limit": "latest",
  "dotenv": "latest",
  "cors": "latest"
}
```

---

## Environment Variables Needed

```bash
# Congress.gov API (FREE)
CONGRESS_API_KEY=your_key_here

# EIA API - gas/energy prices (FREE)
EIA_API_KEY=your_key_here

# FRED API - dollar index, interest rates, economic data (FREE)
FRED_API_KEY=your_key_here

# Treasury FiscalData API - no key needed

# Database (skip for MVP - call APIs directly)
# DATABASE_URL=postgresql://user:password@localhost:5432/trackamerica

# Azure OpenAI (TBD - for AI Q&A phase)
# AZURE_OPENAI_API_KEY=your_key_here
# AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
# AZURE_OPENAI_DEPLOYMENT_NAME=gpt-4o
# AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-ada-002

# API Settings
PORT=3000
NODE_ENV=development
```

---

## 📊 Architecture Diagram
- <TBD> model to be decided for now examples uses 4o
```
┌─────────────────────────────────────┐
│   Expo App (Web + iOS + Android)    │
│  - Interactive USA Map              │
│  - Representatives List             │
│  - Voting Records                   │
│  - AI Chatbot UI                    │
└──────────────┬──────────────────────┘
               │ (REST API)
               ↓
┌──────────────────────────────────────┐
│      Backend API (Express.js)        │
│  - Congress.gov integration          │
│  - Data caching                      │
│  - AI orchestration                  │
│  - Rate limiting                     │
└───┬──────────────────────┬───────────┘
    ↓                      ↓
┌────────────────┐   ┌─────────────────┐
│  PostgreSQL    │   │  Azure OpenAI   │
│  + pgvector    │   │  - Embeddings   │
│                │   │  - Chat (GPT-4o)│
│  Tables:       │   └─────────────────┘
│  - reps        │
│  - bills       │
│  - votes       │
│  - bill_chunks │
│  - embeddings  │
└────────────────┘
        ↑
        │ (Fetch data)
        │
┌────────────────┐
│ Congress.gov   │
│      API       │
└────────────────┘
```

---

## 🎯 Development Phases

### Phase 1: Local Development (Weeks 1-4)
- Build with Expo locally
- Use local PostgreSQL (Docker)
- Test Congress.gov API
- Build basic UI (map, lists)

### Phase 2: Add Intelligence (Weeks 5-8)
- Set up pgvector
- Integrate Azure OpenAI
- Build chatbot functionality
- Ingest bill data

### Phase 3: Polish (Weeks 9-10)
- Add animations (optional)
- Improve UI/UX
- Testing
- Bug fixes

### Phase 4: Deploy (Week 11-12)
- Deploy to Azure
- Submit to App Stores
- Launch! 🚀

---

## 📝 Notes

- **Start simple:** Build core features first, add complexity later
- **One codebase:** Same code runs on web, iOS, and Android
- **No auth:** Users can use app immediately, no signup friction
- **Local-first:** Preferences saved on device (AsyncStorage)
- **Scalable:** Can grow to millions of users with this stack
- **Cheap to run:** ~$150-300/month in production

---

**Ready to build? See `IMPLEMENTATION_PLAN.md` for step-by-step guide!**
