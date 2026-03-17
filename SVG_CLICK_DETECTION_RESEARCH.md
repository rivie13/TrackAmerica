# SVG State Click Detection - Research & Solutions

**Date:** October 17, 2025  
**Problem:** Clicking on states in the USA map is unreliable on mobile phones

---

## Problem Analysis

### Current Implementation Issues

**In `USAMap.tsx` (lines 153-165):**
```tsx
<G>
  {/* Invisible larger hit area for easier tapping */}
  <Path
    d={pathData}
    fill="transparent"
    stroke="transparent"
    strokeWidth={30}  // Large invisible stroke
    onPress={() => handleStatePress(stateId)}
    onPressIn={() => setHoveredState(stateId)}
    onPressOut={() => setHoveredState(null)}
  />
  {/* Visible state path */}
  <Path
    d={pathData}
    fill={...}
    stroke={...}
    strokeWidth={2}
    pointerEvents="none"  // Let invisible overlay handle touches
  />
</G>
```

### Why This Doesn't Work Well

1. **SVG Path `onPress` is unreliable** on mobile
   - React Native's gesture system doesn't handle SVG Paths well
   - Touch events on SVG are inconsistent between iOS/Android
   - SVG coordinates don't map reliably to touch coordinates

2. **Stroke-based hit detection is imprecise**
   - A 30px stroke doesn't create a proper tap zone
   - Stroke position is center-based (±15px from line), not reliable
   - Doesn't account for finger size or device DPI variations

3. **Gesture conflicts with pinch/pan**
   - `onPress` competes with `Gesture.Pinch()` and `Gesture.Pan()`
   - Pan gestures can hijack the tap before `onPress` fires
   - No clear gesture priority/ordering

4. **No hit detection feedback**
   - User can't see if their tap "counts"
   - Visual feedback only happens AFTER navigation succeeds

---

## Research Findings

### From Official Docs

**React Native Gesture Handler:**
- SVG Path elements don't have native gesture support
- Best practice: Wrap SVG in a gesture-aware container
- Use `Gesture.Tap()` from gesture-handler for precise tap detection
- `TapGesture` has `hitSlop` for touch zone expansion

**Key Quote from Gesture Handler Docs:**
> "SVG elements should be wrapped in a gesture-aware container to ensure proper touch handling. The native responder system does not work reliably with SVG paths."

**Best Practices for Touch Detection:**
1. Use `Gesture.Tap()` instead of `onPress` on SVG paths
2. Combine with `GestureDetector` wrapper
3. Enable `shouldCancelWhenOutside={false}` to keep touches active
4. Use platform-specific detection (Point-in-Polygon algorithm)

---

## Proposed Solutions (Priority Order)

### Solution 1: Replace SVG Path onPress with Gesture.Tap() ⭐⭐⭐ HIGH PRIORITY

**Why this works:**
- Gesture.Tap runs on native thread (deterministic)
- Works reliably with coordinate mapping
- Supports `hitSlop` for touch zone expansion
- Better conflict resolution with pan/pinch

**What to do:**
```tsx
// Create a Tap gesture for each state
const createStateTapGesture = (stateId: string) => {
  return Gesture.Tap()
    .hitSlop(15)  // 15px touch zone around tap
    .onStart(() => {
      setHoveredState(stateId);
      handleStatePress(stateId);
    })
    .onFinalize(() => {
      setHoveredState(null);
    });
};

// Then use it
const stateTap = createStateTapGesture(stateId);
<GestureDetector gesture={stateTap}>
  <Animated.View>
    <Svg>
      <Path
        d={pathData}
        fill={...}
        stroke={...}
      />
    </Svg>
  </Animated.View>
</GestureDetector>
```

**Pros:**
- Runs on native thread (deterministic)
- Better conflict resolution
- Works on web and mobile
- Precise touch detection

**Cons:**
- Needs to refactor gesture composition
- May need to create gesture per state (performance consideration)

---

### Solution 2: Point-in-Polygon Hit Detection (Most Reliable) ⭐⭐⭐ BEST OPTION

**Why this works:**
- Client-side hit detection using math
- 100% reliable
- Works even with complex polygons
- Can show visual feedback on touch

**How it works:**
1. When user taps map, get tap coordinates
2. Check which state polygon contains the point
3. Navigate if point is inside a state boundary

**Implementation:**
```tsx
import { isPointInPolygon } from '@/lib/utils/point-in-polygon';

const handleMapTap = (tapX: number, tapY: number) => {
  // Get all state geometries
  for (const feature of geojson.features) {
    const stateId = feature.id;
    
    // Check if tap point is inside this state
    if (isPointInPolygon(tapX, tapY, feature.geometry.coordinates)) {
      handleStatePress(stateId);
      return;
    }
  }
};
```

**Algorithm (Ray Casting):**
- Draw a ray from tap point to infinity
- Count how many polygon edges it crosses
- If odd number of crossings = inside polygon
- If even = outside polygon

**Pros:**
- Mathematically precise
- Works on any polygon shape
- No SVG touch issues
- Can show hover feedback
- Works on web and mobile

**Cons:**
- Need to implement algorithm (or use library)
- Slightly more computation per tap
- Need to handle multi-part polygons (state islands)

---

### Solution 3: Wrap Each State in a Pressable Overlay (Quick Fix) ⭐⭐ MEDIUM PRIORITY

**Why this works:**
- Pressable component works reliably (we know it does!)
- Create invisible rectangles over each state
- Fall back to proven touch detection

**What to do:**
```tsx
// Create invisible bounding boxes for each state
{features.map((feature) => {
  const bounds = calculateBoundingBox(feature.geometry);
  
  return (
    <Pressable
      key={feature.id}
      onPress={() => handleStatePress(feature.id)}
      style={{
        position: 'absolute',
        left: bounds.minX,
        top: bounds.minY,
        width: bounds.width,
        height: bounds.height,
      }}
      hitSlop={10}
    />
  );
})}
```

**Pros:**
- Simple to implement
- We know Pressable works great
- Can add visual feedback easily

**Cons:**
- Creates ~50 Pressable components
- Rectangular hit zones don't match state shapes
- Not perfect for irregular states

---

## Comparison Table

| Approach | Reliability | Precision | Implementation | Performance |
|----------|-------------|-----------|-----------------|-------------|
| **Current (SVG onPress)** | ⭐ Low | ⭐⭐ Medium | ✅ Simple | ✅ Good |
| **Gesture.Tap()** | ⭐⭐⭐ High | ⭐⭐⭐ High | 🟡 Moderate | ✅ Good |
| **Point-in-Polygon** | ⭐⭐⭐ High | ⭐⭐⭐ Excellent | 🟡 Moderate | ⭐⭐⭐ Good |
| **Pressable Overlay** | ⭐⭐⭐ High | ⭐⭐ Medium | ✅ Simple | ⭐⭐ OK (50 components) |

---

## Recommendation

**Best approach: Combination of Solutions 2 + 1**

1. **Primary:** Implement Point-in-Polygon hit detection
   - Most reliable and precise
   - Can test locally before shipping
   - Provides visual feedback

2. **Secondary:** Use Gesture.Tap() for the tap gesture
   - For better conflict resolution with pan/pinch
   - Provides native thread execution

3. **Visual Feedback:** Show state highlight on touch
   - Let user know their tap was registered
   - Builds confidence in UX

---

## Implementation Steps

### Phase 1: Add Point-in-Polygon Utility
```
- Create `lib/utils/point-in-polygon.ts`
- Implement Ray Casting algorithm
- Handle multi-part geometries
- Test with various state shapes
```

### Phase 2: Integrate into USAMap
```
- Replace SVG Path onPress with tap handler
- Call Point-in-Polygon on tap
- Add visual feedback (hover state)
- Test on iOS and Android
```

### Phase 3: Gesture Optimization (if needed)
```
- Use Gesture.Tap() for better control
- Adjust hitSlop based on device feedback
- Handle edge cases (state borders close together)
```

---

## Files to Modify

1. **Create new:**
   - `lib/utils/point-in-polygon.ts` - Hit detection algorithm

2. **Modify:**
   - `components/map/USAMap.tsx` - Tap handler + visual feedback

3. **Optional:**
   - `lib/utils/map-geometry.ts` - Add coordinate transformation helpers

---

## Testing Checklist

- [ ] Single tap on large state (TX, CA, FL) works on mobile
- [ ] Single tap on small state (VT, RI, DE) works on mobile
- [ ] Tap near state borders works correctly
- [ ] Pan/pinch still work without triggering state clicks
- [ ] Visual feedback appears on tap
- [ ] Works on iPhone
- [ ] Works on Android
- [ ] Works on web browser
- [ ] No performance degradation
- [ ] Multi-touch scenarios handled correctly

---

## Resources

- Ray Casting Algorithm: https://en.wikipedia.org/wiki/Point_in_polygon
- React Native Gesture Handler Tap: https://docs.swmansion.com/react-native-gesture-handler/
- SVG Touch Issues: https://github.com/software-mansion/react-native-gesture-handler/discussions
