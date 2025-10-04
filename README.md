# TrackAmerica

> Track your representatives, their votes, and understand legislation with AI-powered insights.

**TrackAmerica** is a cross-platform (web + mobile) application that helps citizens stay informed about their federal representatives and legislation. Built with Expo (React Native), Express, PostgreSQL, and Azure OpenAI.

---

## 🎯 Features

- 🗺️ **Interactive USA Map** - Click any state to view representatives
- 👥 **Representative Profiles** - View senators and house members by state
- 📜 **Bill Tracking** - Browse and search federal legislation
- 🗳️ **Voting Records** - See how representatives voted on bills
- 🤖 **AI Chatbot** - Ask questions about bills in plain English (powered by GPT-4o) [TBD what model will be used]
- 🔍 **Semantic Search** - Find relevant information about bills and search for bills using AI embeddings

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22+ (LTS recommended)
- **npm** 9+
- **Git**
- **PostgreSQL** 14+ (for local development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rivie13/TrackAmerica.git
   cd TrackAmerica
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then follow [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) to get your API keys.

4. **Start the development servers**
   
   **Frontend (Expo):**
   ```bash
   npm start          # Start Expo dev server
   npm run web        # Run in browser
   npm run ios        # Run on iOS simulator
   npm run android    # Run on Android emulator
   ```
   
   **Backend (API):**
   ```bash
   npm run api        # Start Express server on localhost:3000
   ```

---

## 📚 Documentation

### Core Documentation
- **[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)** - Development roadmap and feature timeline
- **[TECH_STACK.md](./TECH_STACK.md)** - Technologies, architecture, and deployment strategy
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)** - Step-by-step guide to get API keys and services

### Development Guides
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute to the project
- **[COMMIT_GUIDELINES.md](./COMMIT_GUIDELINES.md)** - Commit message conventions
- **[.github/BRANCH_PROTECTION.md](./.github/BRANCH_PROTECTION.md)** - Git workflow and branch protection rules
- **[api/README.md](./api/README.md)** - Backend API documentation

### AI Agent Instructions
- **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - Project overview for AI assistants
- **[.github/instructions/coding-standards.instructions.md](./.github/instructions/coding-standards.instructions.md)** - TypeScript/React/Node coding standards
- **[.github/instructions/git-hygiene.instructions.md](./.github/instructions/git-hygiene.instructions.md)** - Git branching and PR conventions
- **[.github/instructions/agent-workflow.instructions.md](./.github/instructions/agent-workflow.instructions.md)** - Focused, incremental development rules

---

## 🏗️ Project Structure

```
TrackAmerica/
├── app/                       # Expo Router file-based routing (pages)
│   ├── _layout.tsx           # Root layout (runs first, initialization)
│   ├── (tabs)/               # Route group: main navigation (URL: /)
│   │   ├── _layout.tsx      # Tab layout (Stack, will become Tabs)
│   │   └── index.tsx        # Home screen (URL: /)
│   ├── (states)/             # Route group: state detail pages
│   │   ├── _layout.tsx      # States layout (Stack with back button)
│   │   └── [code].tsx       # Dynamic route (URL: /california, /texas, etc)
│   └── README.md            # Route groups and navigation docs
├── components/               # Reusable React components (feature-based)
│   ├── ui/                  # Generic UI components (buttons, cards, text)
│   │   ├── PageTitle.tsx   ✅ Main title component
│   │   ├── Subtitle.tsx    ✅ Subtitle text
│   │   ├── StatusCard.tsx  ✅ Status card with variants
│   │   └── index.ts        # UI barrel export
│   ├── map/                 # Map components (USA map, state shapes)
│   │   └── USAMap.tsx      # Interactive SVG map (planned)
│   ├── representatives/     # Representative components (cards, votes)
│   │   └── RepCard.tsx     # Rep info card (planned)
│   ├── chat/                # AI chatbot components
│   │   └── ChatBot.tsx     # Chat interface (planned)
│   ├── index.ts            # Main component barrel export
│   └── README.md           # Component organization guide
├── lib/                     # Shared utilities and types (frontend only)
│   ├── types.ts           # Shared TypeScript interfaces
│   └── api-client.ts      # Helper functions to call backend API (planned)
│   └── README.md          # Library documentation
├── api/                    # Express backend server
│   ├── controllers/       # Business logic (planned)
│   ├── routes/            # API route handlers (planned)
│   ├── services/          # External API integrations (planned)
│   ├── middleware/        # Custom middleware (planned)
│   ├── server.ts          # Express entry point
│   └── README.md          # API documentation
├── prisma/                # Database schema and migrations (planned)
│   └── schema.prisma     # Prisma schema (planned)
├── .github/               # GitHub Actions, workflows, instructions
│   ├── workflows/        # CI/CD pipelines (lint, type-check, build)
│   └── instructions/     # AI coding agent rules
├── .husky/                # Git hooks (pre-commit, commit-msg)
├── global.css            # Tailwind CSS directives for NativeWind
├── .env.example          # Environment variable template
└── package.json          # Dependencies and scripts
```

### Directory Organization Philosophy

**Route Groups (app/):**
- Use `(group)` syntax for organization without affecting URLs
- Each group has its own `_layout.tsx` defining navigation structure
- Example: `app/(tabs)/index.tsx` → URL is `/`, not `/tabs/`

**Feature-Based Components (components/):**
- Organized by domain (`ui`, `map`, `representatives`, `chat`)
- Avoids dumping everything into one flat directory
- Easy to find components related to specific features
- Each feature has a barrel export (`index.ts`)

**Utilities & Types (lib/):**
- Pure functions, API clients, shared types
- **Frontend only** - calls our backend API at `/api/*`
- No direct calls to Congress.gov or Azure (that's backend's job)
- Simple and flat structure (types.ts, api-client.ts)

See individual `README.md` files in each directory for detailed documentation.

---

## 🛠️ Development Workflow

### Available Scripts

**Frontend (Expo):**
- `npm start` - Start Expo development server
- `npm run web` - Run app in browser
- `npm run ios` - Run on iOS simulator (macOS only)
- `npm run android` - Run on Android emulator

**Backend (API):**
- `npm run api` - Start Express server with hot reload
- `npm run api:build` - Build TypeScript to JavaScript

**Code Quality:**
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Auto-fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without changing files
- `npm run type-check` - Run TypeScript compiler checks

**Git Hooks (automatic):**
- Pre-commit: Runs lint, format check, and type check
- Commit-msg: Validates commit message format (Conventional Commits)

**CI/CD:**
[![CI](https://github.com/rivie13/TrackAmerica/actions/workflows/ci.yml/badge.svg)](https://github.com/rivie13/TrackAmerica/actions/workflows/ci.yml)
- Runs on every PR to `dev` and `main`
- Status checks: lint and type-check, build [these must pass before merging]

### Git Workflow

1. **Create feature branch from `dev`:**
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit:**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```
   ✅ Pre-commit hooks will run automatically

   Make sure to read COMMIT_GUIDELINES to learn how to properly format your commit messages.

3. **Push and open PR to `dev`:**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then open a Pull Request on GitHub targeting `dev` branch.

4. **CI checks must pass:**
   - ✅ Linting (ESLint)
   - ✅ Formatting (Prettier)
   - ✅ Type checking (TypeScript)
   - ✅ Build (Expo web export)

5. **Merge to `dev` → later merge `dev` to `main` for production**

See [.github/BRANCH_PROTECTION.md](./.github/BRANCH_PROTECTION.md) for detailed workflow.

---

## 🧪 Testing

### Manual Testing

**Frontend:**
```bash
npm start
# Open http://localhost:8081 in browser
# Or press 'w' to open in web browser
```

**Backend:**
```bash
npm run api
# Test health endpoint:
curl http://localhost:3000/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-02T12:00:00.000Z",
  "message": "TrackAmerica API is running"
}
```

### Automated Testing (Planned)

- Unit tests with Jest
- Integration tests for API endpoints
- E2E tests with Detox (mobile) and Playwright (web)

---

## 📦 Tech Stack

### Frontend
- **Expo** - React Native framework for universal apps
- **Expo Router** - File-based routing
- **TypeScript** - Type safety
- **NativeWind** - Tailwind CSS for React Native (planned)
- **AsyncStorage** - Local data persistence

### Backend
- **Node.js** + **Express** - API server
- **TypeScript** - Type-safe backend code
- **Prisma** - Type-safe database ORM (planned)
- **PostgreSQL** with **pgvector** - Database with vector search (planned)

### AI & External APIs
- **Azure OpenAI** - GPT-4o (TBD what model will be used) for chatbot, embeddings for semantic search
- **Congress.gov API** - Federal representatives, bills, and voting records

### DevOps
- **GitHub Actions** - CI/CD pipeline
- **Husky** - Git hooks (pre-commit, commit-msg)
- **Commitlint** - Enforce Conventional Commits
- **ESLint** + **Prettier** - Code quality and formatting

See [TECH_STACK.md](./TECH_STACK.md) for detailed architecture.

---

## 🌍 Deployment (Planned)

- **Web + API:** Azure App Service
- **Database:** Azure Database for PostgreSQL with pgvector
- **AI:** Azure OpenAI Service
- **Mobile:** Apple App Store (iOS) and Google Play Store (Android)

---

## 🤝 Contributing

We welcome contributions! Please read:

1. **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
2. **[COMMIT_GUIDELINES.md](./COMMIT_GUIDELINES.md)** - Commit message format
3. **[.github/instructions/coding-standards.instructions.md](./.github/instructions/coding-standards.instructions.md)** - Code style guide

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch from `dev`
3. Make your changes following coding standards
4. Ensure all checks pass (`npm run lint`, `npm run type-check`, `npm run format:check`)
5. Commit using Conventional Commits format
6. Push and open a Pull Request to `dev`

---

## 📄 License

ISC

---

## 👨‍💻 Author

**rivie13**

- GitHub: [@rivie13](https://github.com/rivie13)
- Repository: [TrackAmerica](https://github.com/rivie13/TrackAmerica)

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/rivie13/TrackAmerica/issues)
- **Discussions:** [GitHub Discussions](https://github.com/rivie13/TrackAmerica/discussions)

---

## 🗺️ Roadmap

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the complete development timeline.

**Phase 1 (Weeks 1-2):** ✅ Project setup, tooling, and infrastructure  
**Phase 2 (Weeks 3-4):** USA map and state selection  
**Phase 3 (Weeks 5-6):** Representative data and Congress.gov API integration  
**Phase 4 (Weeks 7-8):** Voting records display  
**Phase 5 (Weeks 9-10):** AI chatbot with bill embeddings  
**Phase 6 (Weeks 11-12):** Deployment and polish

---

**Built with ❤️ for transparency in government**

