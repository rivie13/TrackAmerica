# TrackAmerica.com - Simple Implementation Plan

**Last Updated:** September 30, 2025  
**Philosophy:** KISS - Keep It Simple, Stupid

---

## 🎯 Simple Feature List (MVP)

### Core Features Only:
1. ✅ **Interactive USA Map** - Click a state to see its representatives
2. ✅ **Representatives List** - Show 2 Senators + House members per state
3. ✅ **Voting Records** - Display how each rep voted on recent bills
4. ✅ **AI Chatbot UI** - Simple chat interface (wire up AI later)

### What We're NOT Building Yet:
- ❌ User accounts / login
- ❌ Notifications
- ❌ Advanced animations
- ❌ Social features
- ❌ Payment/donations
- ❌ User profiles

---

## 📋 Implementation Phases

### **Phase 1: Setup & Basic UI (Week 1-2)**

#### Week 1: Project Setup
- [ ] Install Node.js (if not already installed)
- [ ] Create Expo app: `npx create-expo-app@latest trackamerica`
- [ ] Set up Expo Router (file-based routing)
- [ ] Install NativeWind for styling
- [ ] Set up TypeScript
- [ ] Create basic folder structure
- [ ] Initialize Git repository
- [ ] Create `.env` file for secrets

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

### **Phase 2: Congress Data & Representatives (Week 3-4)**

#### Week 3: Congress.gov API Integration
- [ ] Sign up for Congress.gov API key (free)
- [ ] Create API client functions:
  - `getRepsByState(stateCode)`
  - `getBillInfo(billId)`
  - `getVotesByMember(bioguideId)`
- [ ] Test API calls with Postman
- [ ] Handle API rate limiting
- [ ] Add loading states in UI

#### Week 4: Display Representatives
- [ ] Build state detail page
- [ ] Show 2 Senators for selected state
- [ ] Show House representatives for selected state
- [ ] Display basic info: name, party, photo (if available)
- [ ] Style representative cards
- [ ] Add "View Voting Record" button

**Deliverable:** Click California → see Senators + House members

---

### **Phase 3: Database Setup (Week 5-6)**

#### Week 5: PostgreSQL Setup
- [ ] Install Docker Desktop (easiest way)
- [ ] Run PostgreSQL in Docker:
  ```bash
  docker run --name trackamerica-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
  ```
- [ ] Install Prisma: `npm install prisma @prisma/client`
- [ ] Initialize Prisma: `npx prisma init`
- [ ] Create database schema (see below)
- [ ] Run migration: `npx prisma migrate dev`

**Database Schema (Prisma):**
```prisma
// prisma/schema.prisma

model Representative {
  id          String   @id @default(uuid())
  bioguideId  String   @unique
  firstName   String
  lastName    String
  party       String
  state       String
  chamber     String   // "Senate" or "House"
  district    String?  // Only for House members
  photoUrl    String?
  createdAt   DateTime @default(now())
  votes       Vote[]
}

model Bill {
  id          String   @id @default(uuid())
  billNumber  String   @unique
  title       String
  sponsor     String?
  congress    Int
  introducedDate DateTime?
  summary     String?
  createdAt   DateTime @default(now())
  votes       Vote[]
}

model Vote {
  id          String   @id @default(uuid())
  repId       String
  billId      String
  voteValue   String   // "Yea", "Nay", "Present", "Not Voting"
  voteDate    DateTime
  createdAt   DateTime @default(now())
  
  representative Representative @relation(fields: [repId], references: [id])
  bill           Bill           @relation(fields: [billId], references: [id])
}
```

#### Week 6: Backend API Setup
- [ ] Create Express.js server (in `/api` folder)
- [ ] Set up CORS for Expo app
- [ ] Create endpoints:
  - `GET /api/representatives/:state`
  - `GET /api/bills/:billId`
  - `GET /api/votes/:repId`
- [ ] Add caching logic (check DB first, then Congress.gov API)
- [ ] Test endpoints with Postman

**Deliverable:** Working backend API that caches Congress data

---

### **Phase 4: Voting Records Display (Week 7-8)**

#### Week 7: Fetch & Display Votes
- [ ] Create voting records page
- [ ] Fetch recent votes for a representative
- [ ] Display in simple list:
  - Bill number & title
  - How rep voted (Yea/Nay/etc)
  - Vote date
- [ ] Add filters (optional): by year, by topic
- [ ] Make bill titles clickable → bill detail page

#### Week 8: Bill Detail Page
- [ ] Create bill detail page
- [ ] Show bill metadata: title, sponsor, date
- [ ] Show bill summary (from Congress.gov)
- [ ] Show all votes on this bill
- [ ] Link to full text on Congress.gov
- [ ] Add "Ask AI about this bill" button (UI only)

**Deliverable:** Users can browse voting records and bill details

---

### **Phase 5: AI Chatbot Setup (Week 9-10)**

#### Week 9: pgvector & Embeddings
- [ ] Enable pgvector in PostgreSQL:
  ```sql
  CREATE EXTENSION vector;
  ```
- [ ] Add bill chunks table to Prisma schema:
  ```prisma
  model BillChunk {
    id        String   @id @default(uuid())
    billId    String
    chunkText String   @db.Text
    embedding Unsupported("vector(1536)")?
    createdAt DateTime @default(now())
  }
  ```
- [ ] Sign up for Azure OpenAI
- [ ] Create function to chunk bill text (500 words per chunk)
- [ ] Create embeddings for chunks using Azure OpenAI
- [ ] Store embeddings in PostgreSQL

#### Week 10: Connect Chatbot
- [ ] Build chatbot UI component
- [ ] Create chatbot API endpoint: `POST /api/chat`
- [ ] Implement RAG (Retrieval-Augmented Generation):
  1. User asks question
  2. Convert question to embedding
  3. Search pgvector for similar bill chunks
  4. Send question + relevant chunks to Azure OpenAI
  5. Return AI response
- [ ] Add chat history (local storage only)
- [ ] Style chatbot interface

**Deliverable:** Working AI chatbot that answers bill questions

---

### **Phase 6: Polish & Test (Week 11)**

#### Week 11: UI/UX Polish
- [ ] Add loading spinners
- [ ] Add error messages
- [ ] Improve styling (colors, spacing, fonts)
- [ ] Add dark mode support
- [ ] Test on different screen sizes
- [ ] Test on iOS (if you have Mac/iPhone)
- [ ] Test on Android (Expo Go or emulator)
- [ ] Fix bugs

**Optional Enhancements:**
- [ ] Add basic animations (fade in/out)
- [ ] Add search bar (search reps by name)
- [ ] Add share button (share bill links)
- [ ] Save last viewed state (AsyncStorage)

---

### **Phase 7: Deploy (Week 12)**

#### Week 12: Deployment
- [ ] Deploy backend API to Azure App Service
- [ ] Deploy PostgreSQL to Azure Database
- [ ] Update environment variables in Azure
- [ ] Deploy web app to Azure Static Web Apps
- [ ] Test production deployment
- [ ] Buy domain: trackamerica.com
- [ ] Point domain to Azure
- [ ] Build mobile apps:
  - iOS: `eas build --platform ios`
  - Android: `eas build --platform android`
- [ ] Submit to App Stores (optional for now)

**Deliverable:** Live website + working mobile apps! 🚀

---

## 🎯 Weekly Milestones

| Week | Milestone | What Users Can Do |
|------|-----------|-------------------|
| 1-2  | Interactive Map | Click states |
| 3-4  | Representatives | See their senators & house members |
| 5-6  | Database & API | Faster loading (cached data) |
| 7-8  | Voting Records | See how reps voted on bills |
| 9-10 | AI Chatbot | Ask questions about bills |
| 11   | Polish | Beautiful, smooth experience |
| 12   | Deploy | Use it from anywhere! |

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

## ✅ Success Criteria

You'll know you're done when:

1. ✅ Users can click any US state on a map
2. ✅ They see that state's senators and house representatives
3. ✅ They can view how each rep voted on recent bills
4. ✅ They can click a bill to see details
5. ✅ They can ask the AI chatbot questions about bills
6. ✅ Everything works on web, iOS, and Android
7. ✅ The app is live on trackamerica.com

---

## 📚 Resources

- **Expo Docs:** https://docs.expo.dev/
- **Congress.gov API:** https://api.congress.gov/
- **Prisma Docs:** https://www.prisma.io/docs
- **Azure OpenAI:** https://learn.microsoft.com/en-us/azure/ai-services/openai/
- **NativeWind:** https://www.nativewind.dev/

---

**Ready? Start with Week 1 and build one feature at a time. You got this! 🚀**
