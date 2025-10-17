# Android Touch and Zoom Fixes

## Critical Fixes Applied

### Issue 1: React Hooks Ordering Violation
**Error**: `React has detected a change in the order of Hooks called`

**Problem**: Hooks (useSharedValue, useAnimatedStyle, Gesture) were being called AFTER conditional return statements (loading/error states). This violates React's Rules of Hooks - all hooks must be called in the same order on every render.

**Solution**:
- Moved ALL hooks to the top of the component, BEFORE any conditional returns
- Order: useState → useSharedValue → Gesture creation → useAnimatedStyle → useEffect
- Removed duplicate gesture definitions that were after the return statement

### Issue 2: Touch Events Blocked by Gesture Handler
**Problem**: When wrapping SVG in GestureDetector, the pan gesture was intercepting ALL touch events, preventing Path `onPress` from firing.

**Root Cause**:
- Pan gesture activated immediately on touch
- Even quick taps were treated as pan attempts
- SVG Path onPress events never received the touch

**Solution**:
```typescript
const panGesture = Gesture.Pan()
  .minDistance(20) // Require 20px movement before activating (increased for better tap detection)
  .onUpdate((event) => {
    const newX = savedTranslateX.value + event.translationX;
    const newY = savedTranslateY.value + event.translationY;
    
    // Calculate bounds to prevent panning over UI elements
    const maxPan = (scale.value - 1) * 200;
    
    // Clamp translation to keep map within viewport
    translateX.value = Math.max(-maxPan, Math.min(maxPan, newX));
    translateY.value = Math.max(-maxPan, Math.min(maxPan, newY));
  })
```

This allows:
- Quick taps (< 20px movement) → Go through to Path onPress → Navigate to state
- Drag gestures (> 20px movement) → Activate pan → Move map (with bounds)
- Pan bounds prevent map from covering text/buttons

### Issue 3: Small States Still Hard to Tap
**Problem**: Users could only click on larger states like Texas and California. Small states (Rhode Island, Delaware, Hawaii) were too small to tap accurately on mobile.

**Root Cause**: 
- SVG Path elements had no expanded touch targets
- Small geographic areas = small touch targets (below 44x44px recommended minimum)
- No gesture handling library for proper mobile interaction

**Solution**:
- Installed `react-native-gesture-handler` for better touch handling
- Added **30px invisible stroke** overlay for much larger touch targets
- Added pinch-to-zoom capability so users can zoom in on small states
- Pan gesture allows navigation across the zoomed map

### Issue 4: Single State Map Not Showing Correctly (Senator View)
**Problem**: When filtering to show a single state in SenatorsView, the state was cut off or didn't display properly.

**Root Cause**:
- Variable name collision (`width`/`height` used as both props and local variables)
- Aspect ratio mismatch between calculated viewBox and container
- Missing `preserveAspectRatio` attribute on SVG
- Insufficient padding around single state bounds

**Solution**:
- Renamed local variables to `boundsWidth`/`boundsHeight` to avoid conflicts
- Increased padding from 10% to 20% for better single state visibility
- Added `preserveAspectRatio="xMidYMid meet"` to SVG to maintain aspect ratio
- Changed SenatorsView to use square aspect ratio (width = height) for consistent display
- Added border container to visualize map boundaries

### 5. Large States Not Fitting on Screen (State Detail Pages)
**Problem**: On state detail pages, large states (Texas, California, Alaska) didn't fit properly in the representative views on mobile screens.

**Root Cause**:
- Fixed width/height values (400x400px) didn't account for different screen sizes
- No responsive sizing based on device dimensions

**Solution**:
- Used `Dimensions.get('window').width` to get actual screen width
- Calculate map size dynamically: `Math.min(screenWidth - 32, 500)` (max 500px with padding)
- Made DistrictMap and SenatorsView responsive

### 3. No Zoom Capability on Main USA Map
**Problem**: Users couldn't zoom in on the main screen to see smaller states better.

**Root Cause**:
- No gesture handlers implemented
- Static SVG rendering without interaction support

**Solution**:
- Added GestureDetector with simultaneous pinch and pan gestures
- Zoom range: 1x to 5x
- Smooth pan and zoom with Reanimated 2 animations

## Technical Implementation

### Libraries Added
- `react-native-gesture-handler` - Professional gesture handling for React Native
- Already had `react-native-reanimated` - For smooth animations

### Files Modified

#### 1. `app/_layout.tsx`
```tsx
// Wrapped entire app with GestureHandlerRootView
<GestureHandlerRootView style={{ flex: 1 }}>
  <Stack screenOptions={{ headerShown: false }} />
</GestureHandlerRootView>
```

#### 2. `components/map/USAMap.tsx`
- Added zoom/pan state using `useSharedValue` from Reanimated
- Created pinch gesture for zooming (1x-5x range)
- Created pan gesture for dragging
- Combined gestures with `Gesture.Simultaneous()`
- Wrapped SVG in `GestureDetector` and `Animated.View`

#### 3. `components/map/DistrictMap.tsx`
- Made width/height responsive using Dimensions API
- Added same zoom/pan gestures as USAMap
- Renamed local transform variables to avoid conflicts (`geoScale`, `geoTranslateX`, etc.)
- Renamed gesture state variables (`zoomScale`, `panX`, `panY`)

#### 4. `components/views/DistrictsView.tsx`
- Changed from fixed `width={400} height={400}` to dynamic sizing
- Uses `Math.min(screenWidth - 32, 500)` for responsive map size
- Ensures maps fit on all screen sizes

#### 5. `components/views/SenatorsView.tsx`
- Same responsive sizing approach
- 3:4 aspect ratio for state outline map
- Dynamic width/height based on screen size

## User Experience Improvements

### Before
- ❌ Small states almost impossible to tap on mobile
- ❌ Large states overflow screen on state detail pages
- ❌ No way to zoom in for better view
- ❌ Fixed sizes don't work across devices

### After
- ✅ Users can zoom in to tap small states easily
- ✅ All maps fit properly on screen (responsive)
- ✅ Pinch-to-zoom works on all maps (1x-5x zoom)
- ✅ Pan gesture allows navigation when zoomed in
- ✅ Smooth animations with Reanimated
- ✅ Works on phones, tablets, and web

## Gesture Controls

### Main USA Map (Home Screen)
- **Pinch**: Zoom in/out (1x to 5x)
- **Pan**: Drag to move around when zoomed
- **Tap**: Navigate to state detail page

### State Detail Maps (Districts & Senators Views)
- **Pinch**: Zoom in/out to see district boundaries
- **Pan**: Navigate across zoomed map
- **Tap**: Future - select district/representative

## Testing Recommendations

1. **Small States**: Try tapping Rhode Island, Delaware, Connecticut
   - Should be able to zoom in first, then tap
   
2. **Large States**: Navigate to Texas, California, Alaska state pages
   - Maps should fit screen without overflow
   - Should be able to zoom and pan
   
3. **Different Devices**: Test on:
   - Small phones (iPhone SE size)
   - Regular phones (iPhone 14 size)
   - Large phones (iPhone Pro Max size)
   - Tablets
   - Web browser

## Technical Notes

### Gesture Handler vs Native Touch
- Using `react-native-gesture-handler` instead of native touch events
- Better performance (runs on native thread)
- More reliable touch detection on Android
- Supports complex gestures (simultaneous pinch+pan)

### Why Reanimated?
- Smooth 60fps animations
- Runs on UI thread (no JS bridge lag)
- Better performance than Animated API
- Works seamlessly with Gesture Handler

### Responsive Sizing Strategy
```typescript
const screenWidth = Dimensions.get('window').width;
const mapSize = Math.min(screenWidth - 32, 500);
```
- 32px padding (16px each side)
- Max 500px to prevent too-large maps on tablets
- Scales down for smaller devices

## Future Enhancements

1. **Double-tap to zoom**: Quick zoom to 2x on double-tap
2. **Reset zoom button**: Quick way to return to 1x zoom
3. **Zoom to fit**: Auto-zoom to selected state
4. **Touch feedback**: Visual indicator when state is pressed
5. **Accessibility**: VoiceOver support for state selection

## Documentation References

- [React Native Gesture Handler Docs](https://docs.swmansion.com/react-native-gesture-handler/)
- [Touch Interaction Guidelines (Microsoft)](https://learn.microsoft.com/en-us/windows/apps/design/input/touch-interactions)
- Minimum touch target: 44x44 epx (Windows) / 44x44 pts (iOS)
- Small state problem: Geographic size ≠ Touch target size

## Commit Message

```
fix(mobile): Add zoom/pan gestures and responsive sizing for Android

- Install react-native-gesture-handler for proper touch handling
- Add pinch-to-zoom (1x-5x) to all map components
- Add pan gesture for navigation when zoomed
- Make maps responsive using Dimensions API
- Fix small state touch targets (can zoom in now)
- Fix large state overflow on detail pages

Fixes issues where:
- Small states (RI, DE, CT) couldn't be tapped on Android
- Large states (TX, CA, AK) didn't fit screen on detail pages
- No zoom capability on any map views

Related: Mobile UX improvements, Android touch issues
```
