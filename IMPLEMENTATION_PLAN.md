# TrackAmerica.com - Implementation Plan

**Last Updated:** March 16, 2026
**Philosophy:** KISS - Keep It Simple, Stupid
**Focus:** Federal level only (state/local later)

---

## Vision

TrackAmerica is an **all-in-one, non-biased national dashboard**. Open data on the economy, government approval, national debt, AND congressional accountability. The app you open to get a quick, honest snapshot of how the country is doing.

---

## Feature List (MVP)

### Core Features:
1. **National Dashboard** - Key indicators: gas prices, dollar value, interest rates, debt, approval ratings with trend data
2. **Interactive USA Map** - Click a state to see its representatives
3. **Representatives List** - Show 2 Senators + House members per state
4. **Voting Records** - Display how each rep voted on recent bills
5. **AI Bill Q&A** - Ask questions about bills, get answers backed by source text
6. **Buy Me a Coffee** - Donation support link

### What We're NOT Building Yet:
- State/local government tracking (later phases)
- User accounts / login
- Notifications
- Social features
- User profiles

---

## 📋 Implementation Phases

### **Phase 1: Setup & Basic UI (Week 1-2)**

#### Week 1: Project Setup ✅ COMPLETE
- [x] Install Node.js (if not already installed)
- [x] Create Expo app: `npx create-expo-app@latest trackamerica`
- [x] Set up Expo Router (file-based routing)
- [x] Install NativeWind for styling
- [x] Set up TypeScript
- [x] Create basic folder structure
- [x] Initialize Git repository
- [x] Create `.env` file for secrets

**Folder Structure:**
```
trackamerica/
├── app/                       # Expo Router file-based routing
│   ├── _layout.tsx           # Root layout (initialization, global providers)
│   ├── (tabs)/               # Route group for main navigation
│   │   ├── _layout.tsx      # Tab layout (Stack → will become Tabs)
│   │   └── index.tsx        # Home page (URL: /)
│   ├── (states)/             # Route group for state detail pages
│   │   ├── _layout.tsx      # States layout (Stack with back button)
│   │   └── [code].tsx       # Dynamic state route (URL: /california, /texas)
│   └── README.md            # Navigation and routing documentation
├── components/               # Reusable React components (feature-based)
│   ├── ui/                  # Generic UI components (PageTitle, StatusCard, etc)
│   ├── map/                 # Map components (USAMap, StateShape) [planned]
│   ├── representatives/     # Representative components (RepCard, VoteRecord) [planned]
│   ├── chat/                # AI chatbot components (ChatBot, ChatMessage) [planned]
│   ├── index.ts            # Main barrel export
│   └── README.md           # Component organization guide
├── lib/                     # Shared utilities and types (frontend only)
│   ├── types.ts           # Shared TypeScript interfaces
│   ├── api-client.ts      # Helper functions to call backend (planned)
│   └── README.md          # Library documentation
└── .env                    # Environment variables
```

**Route Groups Explained:**
- `(tabs)` and `(states)` are **route groups** (parentheses)
- They organize files without affecting URLs
- Example: `app/(tabs)/index.tsx` → URL is `/` (not `/tabs/`)
- Each group has its own `_layout.tsx` for navigation structure

**Component Organization:**
- Feature-based structure (`ui/`, `map/`, `representatives/`, `chat/`)
- Avoids flat "dump all files here" anti-pattern
- Easy to find components by feature domain
- Each feature folder has barrel export (`index.ts`)

#### Week 2: USA Map & Navigation
- [ ] Find/create simple SVG USA map
- [ ] Make states clickable
- [ ] Set up routing: click state → navigate to state page
- [ ] Style with NativeWind
- [ ] Test on web browser
- [ ] Test on Expo Go app (phone)

**Deliverable:** Clickable USA map that navigates to state pages

---

### **Phase 2: National Dashboard + Data APIs**

#### National Indicators (Home Screen)

All data from free, open government APIs:

- **Avg gas price (national)** — EIA API (api.eia.gov), trends over 3/6/9/12 months
- **US Dollar valuation (DXY index)** — FRED API (fred.stlouisfed.org), trends over 1/5/10 years
- **Interest rates (Treasury bonds)** — FRED API, trends over 6mo/1/3/5 years
- **National debt** — Treasury FiscalData API (fiscaldata.treasury.gov), rate of increase over 1/5/10/20 years
- **Congress approval rating** — RealClearPolitics/Gallup data, trends over 6mo/1/3/5 years
- **Presidential approval rating** — RealClearPolitics/Gallup data, trends over 6mo/1/3/5 years
- **Supreme Court approval** — Gallup/Pew data, trends over 6mo/1/3/5 years

Tasks:
- [ ] Sign up for EIA API key (free)
- [ ] Sign up for FRED API key (free)
- [ ] Install @tanstack/react-query for data fetching/caching
- [ ] Create API service modules: `lib/services/economic.ts`, `lib/services/approval.ts`
- [ ] Create TanStack Query hooks: `lib/hooks/useNationalData.ts`
- [ ] Build IndicatorCard component (value + trend arrow + % change)
- [ ] Build NationalDashboard component (grid of IndicatorCards)
- [ ] Integrate dashboard into home screen above/below the map

**Deliverable:** Open the app and instantly see how the country is doing

---

### **Phase 3: Congress.gov API + Representatives**

- [ ] Create API client: `lib/services/congress.ts`
- [ ] Create TanStack Query hooks: `lib/hooks/useCongress.ts`
- [ ] Build RepCard component (photo, name, party, district)
- [ ] Update SenatorsView with real senator data
- [ ] Update DistrictsView with real house rep data
- [ ] Build representative detail screen (`app/(states)/rep/[bioguideId].tsx`)
- [ ] Show bio, contact info, recent votes, sponsored legislation

**Deliverable:** Click California -> see real Senators + House members

---

### **Phase 4: Voting Records & Bills**

- [ ] Build VoteCard component (bill name, date, yea/nay)
- [ ] Add voting record section to rep detail page
- [ ] Build bill detail page (`app/bill/[congress]/[type]/[number].tsx`)
- [ ] Show bill metadata, summary, sponsor, votes
- [ ] Add "Recent Congressional Activity" feed on home screen

**Deliverable:** Users can browse voting records and bill details

---

### **Phase 5: AI Bill Q&A**

- [ ] Set up AI service (Azure OpenAI or similar)
- [ ] Build chatbot UI component
- [ ] Implement RAG: chunk bill text, create embeddings, semantic search
- [ ] Create chat API endpoint
- [ ] Add chat history (local storage)

**Deliverable:** Working AI chatbot that answers bill questions

---

### **Phase 6: Polish, Buy Me a Coffee & Deploy**

- [ ] Fix touch detection (onPressIn for SVG paths)
- [ ] Add loading skeletons and error states
- [ ] Add dark mode support
- [ ] Add "Buy Me a Coffee" link (buymeacoffee.com) in footer/settings
- [ ] Deploy web to Vercel/Netlify
- [ ] Buy domain: trackamerica.com
- [ ] Build mobile apps with EAS Build
- [ ] Submit to App Stores

**Deliverable:** Live website + working mobile apps

---

## Milestones

| Phase | Milestone | What Users Can Do | Status |
|-------|-----------|-------------------|--------|
| 1 | Project Setup + Map | Click states on interactive map | ✅ COMPLETE |
| 2 | National Dashboard | See gas prices, dollar value, debt, approval ratings | ⏳ PLANNED |
| 3 | Representatives | See their senators & house members with real data | ⏳ PLANNED |
| 4 | Voting Records | See how reps voted on bills | ⏳ PLANNED |
| 5 | AI Bill Q&A | Ask questions about bills | ⏳ PLANNED |
| 6 | Polish & Deploy | Use it from anywhere + donate via Buy Me a Coffee | ⏳ PLANNED |

---

## 🛠️ Development Commands

### Start Expo App (Frontend)
```bash
cd trackamerica
npm start                # Start development server
npm run web             # Open in browser
npm run ios             # Open iOS simulator (Mac only)
npm run android         # Open Android emulator
```

### Start Backend API
```bash
cd api
npm run dev             # Start Express server with nodemon
```

### Database Commands
```bash
# View database in browser
npx prisma studio

# Create migration after schema changes
npx prisma migrate dev

# Regenerate Prisma client
npx prisma generate
```

### Testing API
```bash
# Get representatives for California
curl http://localhost:3000/api/representatives/CA

# Get bill info
curl http://localhost:3000/api/bills/hr-815

# Test chatbot
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What does HR-815 say about student loans?"}'
```

---

## 📝 Key Implementation Tips

### 1. Start Simple, Add Complexity Later
- Build basic UI first, style it later
- Hardcode test data before connecting real API
- Use console.log() liberally for debugging

### 2. Test Early, Test Often
- Test each feature as you build it
- Use Expo Go to test on your phone daily
- Test web version in browser

### 3. Use AsyncStorage for Local Preferences
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save last viewed state
await AsyncStorage.setItem('lastState', 'CA');

// Load last viewed state
const lastState = await AsyncStorage.getItem('lastState');
```

### 4. Handle Loading & Errors
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

try {
  setLoading(true);
  const data = await fetchReps(stateCode);
  setReps(data);
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}
```

### 5. Keep Components Small
- One component = one responsibility
- Break large pages into smaller components
- Reuse components when possible

---

## 🚀 Getting Started (Day 1)

Run these commands to start:

```bash
# 1. Create new Expo app
npx create-expo-app@latest trackamerica --template tabs

# 2. Navigate to project
cd trackamerica

# 3. Install additional dependencies
npx expo install expo-router react-native-safe-area-context react-native-screens

# 4. Install NativeWind
npm install nativewind
npm install --save-dev tailwindcss@3.3.2

# 5. Install AsyncStorage
npx expo install @react-native-async-storage/async-storage

# 6. Start the app
npm start
```

Then open the app on your phone using Expo Go or in a web browser!

---

## Success Criteria

You'll know you're done when:

1. Users open the app and see a national dashboard (gas, dollar, rates, debt, approvals)
2. Users can click any US state on the map
3. They see that state's senators and house representatives with real data
4. They can view how each rep voted on recent bills
5. They can click a bill to see details
6. They can ask AI questions about bills
7. Everything works on web, iOS, and Android
8. The app is live on trackamerica.com
9. Buy Me a Coffee link is available for supporters

---

## 📚 Resources

- **Expo Docs:** https://docs.expo.dev/
- **Congress.gov API:** https://api.congress.gov/
- **Prisma Docs:** https://www.prisma.io/docs
- **Azure OpenAI:** https://learn.microsoft.com/en-us/azure/ai-services/openai/
- **NativeWind:** https://www.nativewind.dev/

---

**Ready? Start with Week 1 and build one feature at a time. You got this! 🚀**
