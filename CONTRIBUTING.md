# Contributing to TrackAmerica

Thank you for your interest in contributing to TrackAmerica! This document provides guidelines and instructions for contributing to the project.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Documentation](#documentation)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, background, or identity.

### Expected Behavior

- Be respectful and constructive in all interactions
- Focus on what is best for the project and community
- Show empathy towards other contributors
- Accept constructive criticism gracefully

### Unacceptable Behavior

- Harassment, discrimination, or personal attacks
- Trolling, inflammatory comments, or off-topic discussions
- Publishing others' private information without consent

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- **Node.js** 22+ (LTS) installed
- **npm** 9+ installed
- **Git** configured with your name and email
- Basic knowledge of **TypeScript**, **React Native**, and **Node.js**
- Read the [README.md](./README.md) and [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)

### Setup Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/TrackAmerica.git
   cd TrackAmerica
   ```

3. **Add upstream remote:**
   ```bash
   git remote add upstream https://github.com/rivie13/TrackAmerica.git
   ```

4. **Install dependencies:**
   ```bash
   npm install
   ```

5. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Follow [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) to configure your API keys.

6. **Verify setup:**
   ```bash
   npm run lint
   npm run type-check
   npm run format:check
   ```

---

## 🔄 Development Workflow

### Branch Strategy

We use a **Git Flow** inspired workflow:

```
main (production)
  ↑
  └── dev (integration)
        ↑
        └── feature/your-feature
        └── fix/your-bugfix
```

**Branch naming conventions:**
- `feature/descriptive-name` - New features
- `fix/descriptive-name` - Bug fixes
- `hotfix/critical-fix` - Emergency production fixes
- `docs/update-readme` - Documentation updates

See [.github/instructions/git-hygiene.instructions.md](./.github/instructions/git-hygiene.instructions.md) for details.

### Creating a Feature Branch

1. **Sync with upstream:**
   ```bash
   git checkout dev
   git pull upstream dev
   ```

2. **Create feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** (see [Coding Standards](#coding-standards))

4. **Commit your changes** (see [Commit Guidelines](#commit-guidelines))
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request** targeting the `dev` branch

---

## 💻 Coding Standards

We follow strict coding standards to maintain code quality. All code is automatically checked by pre-commit hooks.

### TypeScript

- ✅ Use strict typing - avoid `any`
- ✅ Prefer `unknown` over `any` when type is uncertain
- ✅ Export shared types from `lib/types.ts`
- ✅ Add JSDoc comments for public functions
- ✅ Use `interface` for object shapes, `type` for unions/intersections

**Example:**
```typescript
// Good ✅
interface Representative {
  id: string;
  name: string;
  state: string;
  chamber: 'Senate' | 'House';
}

function getRepresentative(id: string): Promise<Representative> {
  // ...
}

// Bad ❌
function getRepresentative(id: any): any {
  // ...
}
```

### React / React Native (Frontend)

- ✅ Use functional components with hooks
- ✅ Keep components small and single-responsibility
- ✅ Use meaningful component and variable names
- ✅ Add accessibility props (`accessibilityLabel`, `accessible`)
- ✅ Prefer NativeWind/Tailwind classes for styling

**Example:**
```typescript
// Good ✅
export function RepresentativeCard({ rep }: { rep: Representative }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <View accessible accessibilityLabel={`Representative ${rep.name}`}>
      <Text>{rep.name}</Text>
    </View>
  );
}

// Bad ❌
export function Card(props: any) {
  const [a, setA] = useState(false);
  return <View><Text>{props.data.n}</Text></View>;
}
```

### Node.js / Express (Backend)

- ✅ Keep controllers thin - validate → call service → return response
- ✅ Centralize database access in `services/` layer
- ✅ Never leak raw errors to clients - log server-side, return sanitized messages
- ✅ Use async/await, not callbacks

**Example:**
```typescript
// Good ✅
export async function getRepresentativesByState(req: Request, res: Response) {
  try {
    const { state } = req.params;
    const representatives = await representativeService.findByState(state);
    res.json({ data: representatives });
  } catch (error) {
    console.error('Error fetching representatives:', error);
    res.status(500).json({ error: 'Failed to fetch representatives' });
  }
}

// Bad ❌
export function getReps(req: any, res: any) {
  getRepsFromDB(req.params.state, (err, data) => {
    if (err) throw err;
    res.send(data);
  });
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `RepresentativeCard.tsx`)
- Utilities: `camelCase.ts` (e.g., `apiClient.ts`)
- Types: `types.ts`, `interfaces.ts`

### Imports

Order imports logically:
```typescript
// 1. External libraries
import React, { useState } from 'react';
import { View, Text } from 'react-native';

// 2. Internal modules
import { Representative } from '@/lib/types';
import { RepresentativeCard } from '@/components/RepresentativeCard';

// 3. Relative imports
import { useLocalState } from './hooks';
```

For complete coding standards, see:
- [.github/instructions/coding-standards.instructions.md](./.github/instructions/coding-standards.instructions.md)

---

## 📝 Commit Guidelines

We use **Conventional Commits** to maintain a clear and organized commit history.

### Format

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

### Examples

```bash
# Good ✅
git commit -m "feat(map): add clickable states to usa map"
git commit -m "fix(api): handle rate limit errors from congress api"
git commit -m "docs: update environment setup guide"
git commit -m "chore: upgrade expo to v54"

# Bad ❌
git commit -m "Fixed stuff"
(Capital F, vague, missing type)

git commit -m "feat: Add new feature"
(Capital A - must be all lowercase)

git commit -m "fix: handle Congress.gov errors"
(Contains periods and capital C - no punctuation or capitals allowed)

git commit -m "feat: add user's profile"
(Contains apostrophe - not allowed)
```

### Rules

- ✅ Use **all lowercase** for subject (no capital letters)
- ✅ **No punctuation** in subject (no periods, commas, apostrophes, etc)
- ✅ No period at end of subject
- ✅ Use imperative mood ("add" not "added" or "adds")
- ✅ Keep entire header (type + scope + subject) under 100 characters
- ✅ Add body for complex changes
- ✅ Reference issues in footer when applicable
- ✅ Use hyphens for multi-word terms (e.g., "rate-limit" not "rate limit")

**Commit messages are validated by Husky hooks!** Invalid commits will be rejected.

See [COMMIT_GUIDELINES.md](./COMMIT_GUIDELINES.md) for complete details.

---

## 🔀 Pull Request Process

### Before Opening a PR

1. **Sync with upstream `dev`:**
   ```bash
   git checkout dev
   git pull upstream dev
   git checkout your-feature-branch
   git rebase dev
   ```

2. **Run all quality checks:**
   ```bash
   npm run lint
   npm run format:check
   npm run type-check
   ```

3. **Fix any errors:**
   ```bash
   npm run lint:fix
   npm run format
   ```

4. **Test your changes manually**

### Opening a PR

1. **Push your branch to your fork**

2. **Open a Pull Request on GitHub:**
   - Target: `dev` branch (NOT `main`)
   - Title: Use Conventional Commit format (e.g., `feat: add usa map component`)
   - Description: Explain what, why, and how

3. **PR Description Template:**
   ```markdown
   ## Description
   Brief summary of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - Describe how you tested this
   - List test cases covered

   ## Checklist
   - [ ] Code follows project coding standards
   - [ ] Ran `npm run lint` and `npm run type-check`
   - [ ] Added/updated documentation
   - [ ] Tested on web/mobile (if applicable)
   ```

### CI Checks

Your PR must pass all CI checks:
- ✅ **Lint and Type Check** - ESLint, Prettier, TypeScript
- ✅ **Build** - Expo web build succeeds

If CI fails, fix the issues and push again.

### Code Review

- A maintainer will review your PR
- Address feedback promptly
- Be open to suggestions and constructive criticism
- Mark conversations as resolved when addressed

### Merging

- PRs are merged by maintainers using **squash and merge**
- Your branch will be deleted after merge
- Close any related issues by referencing them in PR description

---

## 📁 Project Structure

Understanding the codebase:

```
TrackAmerica/
├── app/                    # Expo Router pages (file-based routing)
│   ├── index.tsx          # Home screen (/)
│   ├── state/[code].tsx   # State detail page (/state/CA)
│   └── _layout.tsx        # Root layout with navigation
│
├── components/            # Reusable React components
│   ├── USAMap.tsx        # Interactive SVG map
│   ├── RepCard.tsx       # Representative card component
│   └── ChatBot.tsx       # AI chatbot interface
│
├── lib/                   # Shared utilities
│   ├── types.ts          # TypeScript interfaces and types
│   └── apiClient.ts      # Frontend API client (planned)
│
├── api/                   # Express backend
│   ├── server.ts         # Express app entry point
│   ├── routes/           # API route handlers
│   ├── controllers/      # Request/response logic
│   ├── services/         # Business logic and external APIs
│   └── middleware/       # Custom Express middleware
│
├── prisma/               # Database (planned)
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
│
├── .github/              # GitHub configuration
│   ├── workflows/        # CI/CD pipelines
│   ├── instructions/     # AI coding agent rules
│   └── BRANCH_PROTECTION.md
│
├── .husky/               # Git hooks
│   ├── pre-commit       # Runs lint, format, type-check
│   └── commit-msg       # Validates commit message format
│
└── docs/                 # Additional documentation (planned)
```

---

## 🧪 Testing

### Manual Testing

**Frontend:**
```bash
npm start       # Start Expo dev server
# Press 'w' for web, 'i' for iOS, 'a' for Android
```

**Backend:**
```bash
npm run api     # Start API server
curl http://localhost:3000/health
```

### Automated Testing (Planned)

We plan to add:
- **Unit tests** with Jest
- **Integration tests** for API endpoints
- **E2E tests** with Detox (mobile) and Playwright (web)

When tests are added, ensure:
- All new features have tests
- All tests pass before opening PR
- Aim for >80% code coverage

---

## 📚 Documentation

### When to Update Documentation

Update docs when you:
- Add a new feature
- Change existing functionality
- Add new environment variables
- Modify project structure
- Update dependencies

### What to Document

- **README.md** - High-level overview, quick start
- **API docs** - New endpoints in `api/README.md`
- **Code comments** - Complex logic, public APIs
- **IMPLEMENTATION_PLAN.md** - Major feature additions

### Documentation Style

- ✅ Use clear, concise language
- ✅ Include code examples
- ✅ Add links to related docs
- ✅ Use proper Markdown formatting
- ✅ Keep docs up-to-date with code changes

---

## 🎯 Contribution Ideas

Not sure where to start? Here are some ideas:

### Good First Issues
- Add loading spinners to components
- Improve error messages
- Add input validation
- Write unit tests
- Fix typos in documentation

### Features
- Implement USA map component
- Add representative search
- Create bill detail page
- Build AI chatbot interface

### Improvements
- Optimize performance
- Improve accessibility
- Enhance mobile UX
- Add dark mode support

Check [GitHub Issues](https://github.com/rivie13/TrackAmerica/issues) for open tasks.

---

## ❓ Questions?

- **Issues:** [GitHub Issues](https://github.com/rivie13/TrackAmerica/issues)
- **Discussions:** [GitHub Discussions](https://github.com/rivie13/TrackAmerica/discussions)
- **Email:** Contact repository owner through GitHub profile

---

## 🙏 Thank You!

Every contribution helps make TrackAmerica better. Whether it's a bug fix, feature, documentation improvement, or even a typo fix - we appreciate your effort!

**Happy coding! 🚀**
