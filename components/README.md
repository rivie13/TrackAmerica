# components/ Directory

This directory contains **all reusable React/React Native components** organized by feature domain.

## Structure

```
components/
├── ui/                    # Generic UI components (buttons, cards, text)
│   ├── PageTitle.tsx     ✅ Main page title component
│   ├── Subtitle.tsx      ✅ Subtitle text component
│   ├── StatusCard.tsx    ✅ Status/message card with variants
│   └── index.ts          # Barrel export for UI components
├── map/                   # Map-related components
│   ├── USAMap.tsx        # Interactive SVG USA map (planned)
│   ├── StateShape.tsx    # Individual state SVG (planned)
│   └── index.ts          # Barrel export for map components
├── representatives/       # Representative and voting record components
│   ├── RepCard.tsx       # Representative info card (planned)
│   ├── VoteRecord.tsx    # Voting record display (planned)
│   └── index.ts          # Barrel export for rep components
├── chat/                  # AI chatbot components
│   ├── ChatBot.tsx       # Main chat interface (planned)
│   ├── ChatMessage.tsx   # Individual message bubble (planned)
│   └── index.ts          # Barrel export for chat components
└── index.ts              # Main barrel export for all components
```

## Organization Philosophy

### Feature-Based Structure
Components are organized by **feature domain**, not by type. This makes it easy to:
- Find all components related to a specific feature
- Understand component responsibilities at a glance
- Avoid dumping everything into a single flat directory

### What Goes Where?

**ui/** - Generic, reusable visual elements
- Buttons, cards, typography, form inputs
- No domain-specific logic
- Can be used anywhere in the app
- Examples: `Button`, `Card`, `PageTitle`, `StatusCard`

**map/** - USA map and state selection
- SVG map rendering
- Click handlers for states
- Map-specific UI (tooltips, legends)
- Examples: `USAMap`, `StateShape`, `MapLegend`

**representatives/** - Representative data display
- Representative cards
- Voting records
- Bill summaries
- Examples: `RepCard`, `VoteRecord`, `BillCard`

**chat/** - AI chatbot interface
- Chat UI components
- Message bubbles
- Input fields
- Examples: `ChatBot`, `ChatMessage`, `ChatInput`

## Coding Standards

1. **One component per file** - Keep files focused and small
2. **Use TypeScript** - All components must have proper types
3. **Export from index.ts** - Use barrel exports for clean imports
4. **Use NativeWind** - Style with className and Tailwind utilities
5. **Props interfaces** - Define clear prop interfaces with JSDoc

## Example Component Structure

```tsx
import { View, Text } from 'react-native';

interface MyComponentProps {
  /** The title to display */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Custom className for styling */
  className?: string;
}

/**
 * MyComponent - Brief description
 * 
 * @example
 * <MyComponent title="Hello" subtitle="World" />
 */
export function MyComponent({ 
  title, 
  subtitle, 
  className = '' 
}: MyComponentProps) {
  return (
    <View className={`p-4 ${className}`}>
      <Text className="text-xl font-bold">{title}</Text>
      {subtitle && <Text className="text-gray-600">{subtitle}</Text>}
    </View>
  );
}
```

## Import Examples

```tsx
// Import specific UI components
import { PageTitle, StatusCard } from '@/components/ui';

// Import from main barrel export
import { PageTitle, StatusCard, USAMap, RepCard } from '@/components';

// Import individual component (less common, but allowed)
import { USAMap } from '@/components/map/USAMap';
```

## When to Create a New Component

✅ **DO create a component when:**
- You're copying/pasting JSX in multiple places
- A section of UI has distinct responsibility
- You want to unit test specific UI logic
- The component can be reused or composed

❌ **DON'T create a component when:**
- It's only used once and won't be reused
- It's trivially small (1-2 lines of JSX)
- It doesn't add meaningful abstraction

## Component Checklist

Before committing a new component, ensure:
- [ ] TypeScript types for all props
- [ ] JSDoc comment explaining purpose
- [ ] Styled with NativeWind className
- [ ] Exported from feature index.ts
- [ ] Exported from main components/index.ts (if public API)
- [ ] Follows "small, single-purpose" coding standard
