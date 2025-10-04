# app/ Directory

This directory defines the **navigation structure** of the application using Expo Router's file-based routing.

## Current Structure

```
app/
├── _layout.tsx          # Root layout (runs before any other route)
├── (tabs)/              # Route group for main navigation (URL: /)
│   ├── _layout.tsx     # Tab layout (currently Stack, will be Tabs)
│   └── index.tsx       # Home screen (URL: /)
└── (states)/            # Route group for state detail pages
    ├── _layout.tsx     # States layout (Stack with back button)
    └── [code].tsx      # Dynamic state detail (URL: /california, /texas, etc)
```

## Route Groups Explained

### What are Route Groups?
Directories with names in parentheses `(group)` are **route groups**. They organize files without affecting the URL structure.

**Example:**
- `app/(tabs)/index.tsx` → URL: `/` (not `/tabs/`)
- `app/(states)/[code].tsx` → URL: `/california` (not `/states/california`)

### Why Use Route Groups?
1. **Organize related pages** - Group pages by feature or layout type
2. **Share layouts** - Each group can have its own `_layout.tsx`
3. **Clean URLs** - Keep URLs simple while maintaining code organization
4. **Multiple layouts** - Same URL can have different layouts in different contexts

## Current Groups

### (tabs) - Main Navigation
- **Purpose:** Primary app navigation (home, search, profile in future)
- **URL:** `/` (root level)
- **Layout:** Stack navigator (will become Tabs navigator in Phase 2)
- **Routes:**
  - `index.tsx` → `/` (home screen with USA map)

### (states) - State Details
- **Purpose:** Detail pages for individual states
- **URL:** `/:code` (e.g., `/california`, `/texas`)
- **Layout:** Stack navigator with back button
- **Routes:**
  - `[code].tsx` → `/california`, `/texas`, etc (dynamic state pages)

## File Conventions

### _layout.tsx
- Defines how routes in this directory relate (Stack, Tabs, Drawer, etc)
- Rendered before page routes
- Root `_layout.tsx` runs first (initialization, fonts, global providers)

### index.tsx
- Default route for a directory
- `(tabs)/index.tsx` → `/` (app homepage)
- `profile/index.tsx` → `/profile`

### [param].tsx (Dynamic Routes)
- Match dynamic URL segments
- `[code].tsx` matches `/california`, `/texas`, etc
- Access with `useLocalSearchParams()` hook

### [...param].tsx (Catch-All Routes)
- Match multiple segments
- `[...path].tsx` matches `/a`, `/a/b`, `/a/b/c`
- Useful for deeply nested or variable structures

### +not-found.tsx (Special Route)
- Shown when user navigates to non-existent route
- 404 page equivalent

## Planned Structure (Future Phases)

```
app/
├── _layout.tsx
├── (tabs)/
│   ├── _layout.tsx          # Will become Tabs navigator
│   ├── index.tsx            # Home (USA map)
│   ├── search.tsx           # Search representatives/bills
│   └── profile.tsx          # User profile/settings
├── (states)/
│   ├── _layout.tsx
│   └── [code].tsx           # State detail page
├── bills/
│   ├── _layout.tsx
│   ├── index.tsx            # Bills list
│   └── [billId].tsx         # Individual bill detail
└── +not-found.tsx           # 404 page
```

## Navigation Examples

### Navigating to Routes

```tsx
import { Link, router } from 'expo-router';

// Using Link component
<Link href="/california">View California</Link>

// Using router programmatically
router.push('/california');
router.push({ pathname: '/[code]', params: { code: 'california' } });
```

### Getting Route Parameters

```tsx
import { useLocalSearchParams } from 'expo-router';

export default function StateDetail() {
  const { code } = useLocalSearchParams<{ code: string }>();
  // code = "california" when URL is /california
  return <Text>State: {code}</Text>;
}
```

## Best Practices

1. **Use route groups for organization** - Don't create nested folders unnecessarily
2. **Keep URLs clean** - Use groups to avoid `/tabs/home` when `/home` is clearer
3. **One layout per concern** - Each group should have a single navigation purpose
4. **Layouts are optional** - Only add `_layout.tsx` when you need shared navigation
5. **Dynamic routes for data** - Use `[param]` for IDs, slugs, codes, etc

## Adding New Routes

### Single Static Route
1. Create `app/(tabs)/about.tsx`
2. Access at `/about`
3. No layout changes needed (inherits from `(tabs)/_layout.tsx`)

### Dynamic Route Group
1. Create directory: `app/bills/`
2. Add layout: `app/bills/_layout.tsx` (Stack or other)
3. Add routes:
   - `app/bills/index.tsx` → `/bills`
   - `app/bills/[billId].tsx` → `/bills/hr-815`

### Route with Parameters
1. Create `app/representatives/[bioguideId].tsx`
2. Access params with `useLocalSearchParams<{ bioguideId: string }>()`
3. Navigate: `router.push({ pathname: '/representatives/[bioguideId]', params: { bioguideId: 'A000360' } })`

## Debugging Routes

```bash
# View all routes in your app
npm start
# Then press 'm' in terminal to open developer menu
# Select "Routes" to see full routing tree
```

## Learn More

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Route Groups](https://docs.expo.dev/router/basics/notation/#parentheses)
- [Dynamic Routes](https://docs.expo.dev/router/basics/notation/#square-brackets)
- [Layouts](https://docs.expo.dev/router/basics/layout/)
