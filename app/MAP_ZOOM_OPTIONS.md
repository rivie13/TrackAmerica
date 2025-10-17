# Map Zoom Transition Options

This document explains different approaches for implementing the zoom-in transition when clicking a state on the USA map.

## Current Implementation ✅

**What we have now:**
- Click a state on the home page USA map
- Navigate to state detail page (`/ca`, `/tx`, etc.)
- State detail page shows:
  - **ZoomIn animation** (500ms) when page loads
  - Large view of **just that state** (calculated viewBox)
  - State rendered in blue with border
  - Title and placeholder content with FadeIn animations

**How it works:**
1. User clicks California on map
2. Navigates to `/ca` route
3. Page calculates bounding box for California geometry
4. Renders SVG with viewBox showing only California (zoomed in)
5. `ZoomIn` animation from `react-native-reanimated` creates zoom effect
6. Text fades in sequentially (300ms, 400ms delays)

**Pros:**
- Simple implementation (no complex animation state management)
- Works cross-platform (web + mobile)
- Uses built-in Reanimated layout animations
- Clean separation: full map on home, single state on detail page

**Cons:**
- Not a true "continuous zoom" from map → state
- Navigation happens first, then animation
- Doesn't preserve exact state position from map

---

## Alternative Approaches

### Option 2: Shared Element Transition (Advanced)

**Best visual experience but more complex:**

Use Expo Router's experimental shared element transitions to animate the state shape from its map position to full-screen.

```tsx
// Home page - mark state as shared element
<Path
  sharedTransitionTag={`state-${stateId}`}
  d={geoPath(feature.geometry)}
  // ... other props
/>

// Detail page - same shared element tag
<Path
  sharedTransitionTag={`state-${stateId}`}
  d={geoPath(stateFeature.geometry)}
  // ... other props
/>
```

**Pros:**
- Smooth continuous animation from map → detail page
- State appears to "lift out" from map
- Professional native-app feel

**Cons:**
- More complex setup
- Experimental API (may change)
- Requires careful coordination of geometry/transforms
- May not work identically on web + mobile

**Resources:**
- [Expo Router Shared Element Docs](https://docs.expo.dev/router/advanced/shared-routes/)
- [Reanimated Shared Element Transitions](https://docs.swmansion.com/react-native-reanimated/docs/shared-element-transitions/overview)

---

### Option 3: Animated Map Zoom (In-Page)

**Instead of navigating, zoom the map in-place:**

Stay on home page and use Reanimated to:
1. Animate map scale/position to focus on clicked state
2. Fade out other states
3. Show state details overlay

```tsx
const scale = useSharedValue(1);
const translateX = useSharedValue(0);
const translateY = useSharedValue(0);

const handleStatePress = (stateId: string, bounds: BoundingBox) => {
  // Calculate zoom scale and pan to center state
  scale.value = withTiming(calculateZoomScale(bounds), { duration: 500 });
  translateX.value = withTiming(calculatePanX(bounds), { duration: 500 });
  translateY.value = withTiming(calculatePanY(bounds), { duration: 500 });
};

const animatedStyle = useAnimatedStyle(() => ({
  transform: [
    { translateX: translateX.value },
    { translateY: translateY.value },
    { scale: scale.value },
  ],
}));
```

**Pros:**
- True zoom animation on same page
- Can show intermediate zoom states
- Feels more like interactive map app

**Cons:**
- More complex state management
- Need to handle pinch-to-zoom, pan gestures
- Doesn't fit file-based routing pattern
- URL doesn't change (worse for web/deep linking)

**Best for:** Map-focused apps like Google Maps
**Not ideal for:** Our use case (content-focused state pages)

---

### Option 4: CSS/SVG viewBox Animation (Web-Only)

**Animate the SVG viewBox itself:**

On web, you can animate SVG viewBox attribute directly:

```tsx
// Animate viewBox from "0 0 975 610" → "100 50 200 150" (state bounds)
const viewBox = useSharedValue("0 0 975 610");

// On state click
viewBox.value = withTiming(`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`);
```

**Pros:**
- Smooth mathematical zoom
- True SVG coordinate space animation

**Cons:**
- **Web-only** (doesn't work on React Native mobile)
- ViewBox attribute animation not well-supported in react-native-svg
- Complex to synchronize with navigation

---

## Recommendation

**For MVP and best compatibility:**
✅ **Stick with current implementation (Option 1)**

**Why:**
- Simple and reliable
- Works perfectly on web AND mobile
- Matches your file-based routing architecture
- Built-in Reanimated animations look professional
- Easy to maintain and debug
- Good enough UX for users (perceived as zoom)

**For future enhancement:**
Consider **Option 2 (Shared Element Transition)** if you want premium feel, but only after:
- Core features complete (reps, bills, voting records)
- Testing on both web and mobile
- Confirming Expo Router shared elements are stable

**Avoid:**
- Option 3: Breaks URL routing pattern
- Option 4: Web-only, not cross-platform

---

## Implementation Details (Current)

**Key files:**
- `app/(tabs)/index.tsx` - Home page with full USA map
- `app/(states)/[code].tsx` - State detail page (current implementation)
- `components/map/USAMap.tsx` - Reusable USA map component

**Animation breakdown:**
```tsx
// State detail page animations:
<Animated.View entering={ZoomIn.duration(500)}>          // Container zooms in
  <Animated.Text entering={FadeIn.delay(300)}>           // Title fades in after 300ms
  <Svg>...</Svg>                                         // Map appears with zoom
  <Animated.Text entering={FadeIn.delay(400)}>           // Description fades in after 400ms
</Animated.View>
```

**ViewBox calculation:**
```typescript
// Calculates bounding box for clicked state
const bounds = getStateBounds(stateFeature.geometry);

// Creates viewBox showing only this state (with padding)
const viewBox = `${bounds.minX - 20} ${bounds.minY - 20} ${bounds.width + 40} ${bounds.height + 40}`;
```

This creates the "zoomed in" effect by constraining SVG viewport to state bounds.

---

## Testing the Current Implementation

1. Start dev server: `npm start`
2. Open web browser: http://localhost:8081
3. Click any state on the USA map
4. Observe:
   - Navigation to `/ca` (or other state code)
   - Page "zooms in" with animation
   - Large state shape appears
   - Title and text fade in sequentially
5. Click back button
6. Try clicking different states

**Expected behavior:**
- Smooth 500ms zoom-in animation
- State fills most of screen
- Clean, professional appearance
- Works on mobile and web

---

## Future Enhancements

Once core features are done, consider:

1. **Add pan/pinch gestures** on state detail page (zoom into state further)
2. **Show congressional districts** on state map (using counties TopoJSON)
3. **Add representative markers** at district locations
4. **Hover tooltips** showing district numbers
5. **Animate transitions** between state list → map → detail

But for now, the current zoom implementation is **production-ready** and **cross-platform compatible**. ✅
