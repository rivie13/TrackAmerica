# Testing Guide - Android Touch & Zoom Fixes

## Quick Test Checklist

### ✅ Home Screen (USA Map)
1. **Tap small state (Rhode Island, Delaware, Connecticut)**
   - Should navigate to state detail page
   - Normal tap - no need to be super precise
   
2. **Pinch to zoom**
   - Pinch out → Zoom in (up to 5x)
   - Pinch in → Zoom out (down to 1x)
   
3. **Pan when zoomed**
   - Zoom in first
   - Drag finger > 20px → Map should move
   - Normal tap < 20px → Should still click state

4. **Zoom then tap small state**
   - Zoom in to 2x-3x
   - Tap Rhode Island → Should navigate to /ri

### Touch Target Improvements
- **20px minimum distance** for pan (increased from 10px)
  - More forgiving for normal taps
  - Still allows pan when you drag
- **Invisible 30px stroke** around each state (increased from 15px)
  - Much easier to tap small states (Delaware, Hawaii, Rhode Island)
  - Larger "hit area" than visible border
- **Pan bounds** to prevent covering UI elements
  - Map stays within viewport when not zoomed
  - Proportional panning allowed when zoomed in

### ✅ State Detail Page (e.g., /ohio, /texas)
1. **Map fits on screen**
   - No overflow/scrolling needed
   - Proper padding on sides
   
2. **Pinch to zoom on districts**
   - Can zoom 1x-5x
   - Smooth animation
   
3. **Pan zoomed district map**
   - Drag > 10px → Pan works
   - Quick tap → Console logs district name

### ✅ Different Screen Sizes
- **Small phone** (iPhone SE): Maps should be smaller but proportional
- **Regular phone** (iPhone 14): Full width minus padding
- **Tablet/Large phone**: Max 500px width (doesn't get too big)

## How to Test

### 1. Start Development Server
```bash
npx expo start --clear
```

### 2. Open on Physical Android Device
- Scan QR code with Expo Go
- OR use `npx expo start --tunnel` for remote testing

### 3. Test Sequence

#### Test 1: Small State Click (MOST IMPORTANT)
```
1. Open app
2. Try to tap Delaware (tiny state on east coast)
   ❌ Before: Hard to tap, often misses
   ✅ After: Can zoom in first, then tap
3. Zoom in to 2x by pinching
4. Tap Delaware
   ✅ Should navigate to /de
```

#### Test 2: Pan vs Tap Distinction
```
1. Open app
2. Quickly tap any state (< 20px movement)
   ✅ Should navigate immediately
3. Drag finger > 20px
   ✅ Should pan the map (not navigate)
4. Pan boundary check
   - Try panning when NOT zoomed
   ✅ Map should stay within viewport bounds
   - Zoom in to 3x
   - Try panning
   ✅ Should allow proportional panning based on zoom level
```

#### Test 3: State Detail Map Sizing
```
1. Navigate to /texas (large state)
2. Check if map fits screen
   ✅ Should not overflow
   ✅ Should have padding on sides
3. Pinch to zoom
   ✅ Should zoom smoothly
4. Drag map
   ✅ Should pan when > 20px movement
   ✅ Should respect bounds (not cover UI text)
```

## Expected Behavior

### Touch Interaction Flow
```
Touch Down → Move < 20px → Touch Up
  ↓
  SVG Path onPress fires (invisible overlay with 30px stroke)
  ↓
  Navigate to state detail page

Touch Down → Move > 20px → Continue dragging
  ↓
  Pan gesture activates
  ↓
  Map moves within bounds (no navigation)
```

### Zoom Behavior
```
Two fingers touch → Pinch outward
  ↓
  Scale increases (1x → 5x max)
  ↓
  Map appears larger

Two fingers touch → Pinch inward
  ↓
  Scale decreases (→ 1x min)
  ↓
  Map returns to normal size
```

## Common Issues & Solutions

### Issue: "Delaware/Hawaii still not clickable"
**Check**: 
- Are you tapping quickly (< 20px movement)?
- Try zooming in first, then tapping
- Invisible 30px stroke should make it much easier
**Solution**: Zoom to 2x-3x, then tap the center of the state

### Issue: "Map pans over the text/buttons"
**Check**:
- Are you zoomed out to 1x? Map should NOT pan much when not zoomed
- Pan bounds: Map locked to viewport when scale = 1x
**Solution**: This is now fixed with pan bounds. When not zoomed, map stays in place. When zoomed, allows proportional panning based on zoom level.
- Or are you accidentally dragging slightly?

**Fix**: Make very quick, sharp taps without finger movement

### Issue: "Hooks error still showing"
**Reason**: Old JS bundle still cached

**Fix**:
```bash
# Clear cache and restart
npx expo start --clear
```

### Issue: "Map is cut off on my device"
**Check**: What's your screen width?

**Expected**: 
- Maps use: `Math.min(screenWidth - 32, 500)`
- Should fit any device with 16px padding each side

## Performance Expectations

### Smooth Animations
- Pinch zoom: 60fps
- Pan: 60fps
- Tap response: < 100ms

### Memory Usage
- Normal: Similar to before
- Reanimated runs on UI thread (not JS)
- Gesture Handler runs natively

## Devices to Test

### Priority 1 (Must Test)
- [ ] Android phone (your primary device)
- [ ] Small screen Android (if available)

### Priority 2 (Nice to Test)
- [ ] Tablet
- [ ] Web browser (for comparison)
- [ ] iOS (if available - should work same)

## Success Criteria

✅ **All tests pass when:**
1. Can click small states after zooming
2. Quick taps navigate (don't pan)
3. Drag gestures pan (don't navigate)
4. Maps fit on all screen sizes
5. No React Hook errors
6. Smooth 60fps animations
7. Pinch zoom works (1x-5x range)

## Debugging Tips

### Check console logs:
- `[DistrictMap] Rendering X districts for StateName` → Component loaded
- `[DistrictMap] Clicked: District Name` → Tap detected (but won't navigate yet)
- No Hook errors → Hooks ordered correctly

### If state won't click:
1. Check console for errors
2. Verify you're doing quick tap (not drag)
3. Try zooming in first
4. Verify `minDistance(10)` is in code

### If zoom doesn't work:
1. Check if GestureHandlerRootView wraps app
2. Verify Animated.View is child of GestureDetector
3. Check that gestures are defined before conditional returns

## Code Reference

### Pan Gesture Config
```typescript
const panGesture = Gesture.Pan()
  .minDistance(10) // KEY: Allows taps to pass through
  .onUpdate(...)
```

### Hooks Order (CRITICAL)
```typescript
// ✅ CORRECT ORDER:
const [state] = useState()          // 1. State
const value = useSharedValue()      // 2. Shared values
const gesture = Gesture.Pan()       // 3. Gestures
const style = useAnimatedStyle()    // 4. Animated styles
useEffect(() => {})                 // 5. Effects

// Then conditional returns:
if (loading) return <Loading />
if (error) return <Error />

// ❌ WRONG - Don't put hooks after returns!
```
