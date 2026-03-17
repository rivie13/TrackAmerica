# Touch Handling Research for TrackAmerica

**Date:** October 17, 2025  
**Topic:** Reliable touch detection on mobile phones for both SVG state clicks and dropdown menu selections

---

## Problem Statement

Currently on mobile phones:
- Dropdown menu items require 5+ fast taps to reliably register
- State map clicks are unreliable
- Touch detection differs between mobile and web
- User experience is frustrating

---

## Research Findings

### 1. Core Issue: React Native Touch Components

**Official Documentation:**
- [React Native Handling Touches](https://reactnative.dev/docs/handling-touches)
- [React Native Pressable Component](https://reactnative.dev/docs/pressable)
- [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation)

**Key Findings:**

#### A. TouchableOpacity vs Pressable
- **TouchableOpacity**: Simple opacity fade effect on press, but doesn't handle complex touch scenarios well
- **Pressable**: Modern, more reliable touch detection with built-in HitRect and PressRect support
- **Recommendation**: Switch from `TouchableOpacity` to `Pressable` for better reliability

#### B. HitSlop & PressRetentionOffset (Critical for small targets)

From React Native docs:
```
HitRect: Defines how far a touch can register AWAY from the wrapped element
- hitSlop: Additional distance outside element where press can start
- Default pressRetentionOffset: {bottom: 30, left: 20, right: 20, top: 20}
- This means touches can be registered 20-30px outside the actual component
```

**Why this matters:**
- Mobile touches are imprecise (fingers are ~10-15mm wide)
- Small UI elements need larger touch zones
- `hitSlop` expands the touch detection zone
- Without it, small targets are almost impossible to hit reliably

#### C. Touch Event Flow (Important!)

```
Pressable Event Sequence:
1. onPressIn   - immediately when finger touches (first event fired)
2. onPress     - after onPressOut (final confirmation)
3. onPressOut  - when finger lifts
4. onLongPress - if held >500ms
```

**Problem in our code:**
- We use `onPress` with `onBlur` timeout
- `onBlur` fires and closes dropdown BEFORE `onPress` completes on mobile
- This is a timing/race condition issue

#### D. React Native vs Web Differences

**Mobile (iOS/Android):**
- Uses native touch event system
- Touch events are dispatched to native thread
- More reliable and immediate
- Gesture Handler runs in native thread (100% deterministic)

**Web:**
- Mouse events behave differently from touch
- Need to handle both pointer and touch events
- Absolute positioning can cause stacking issues

---

## Recommended Solutions (Priority Order)

### Solution 1: Switch to Pressable (HIGH PRIORITY)
**Problem it solves:** Unreliable touch detection on mobile

**What to do:**
```tsx
// BEFORE (current):
<TouchableOpacity onPress={() => handleSelectState(item.code)}>
  <Text>{item.displayName}</Text>
</TouchableOpacity>

// AFTER (recommended):
<Pressable
  onPress={() => handleSelectState(item.code)}
  hitSlop={10}  // Expand touch zone by 10px on all sides
  pressRetentionOffset={20}  // Keep press active up to 20px away
>
  {({ pressed }) => (
    <Text style={{ backgroundColor: pressed ? '#e0e0e0' : 'transparent' }}>
      {item.displayName}
    </Text>
  )}
</Pressable>
```

**Why it works:**
- Pressable has better touch detection than TouchableOpacity
- `hitSlop` creates a larger touch zone
- `pressRetentionOffset` maintains press state when finger moves
- Supports function children for visual feedback

### Solution 2: Remove setTimeout Race Condition (HIGH PRIORITY)
**Problem it solves:** Dropdown closes before touch is registered

**What to do:**
```tsx
// Remove the setTimeout delay in handleSelectState
// Instead, use Pressable's built-in events

// BEFORE:
const handleSelectState = (stateCode: string) => {
  setSearchText('');
  setShowDropdown(false);
  setTimeout(() => {
    router.push(`/${stateCode}` as any);
  }, 50);  // This creates race conditions on mobile!
};

// AFTER:
const handleSelectState = (stateCode: string) => {
  setSearchText('');
  setShowDropdown(false);
  router.push(`/${stateCode}` as any);  // No setTimeout!
};
```

**Why it works:**
- Removes timing uncertainty
- `onPress` is only called AFTER the full press gesture completes
- No race condition with `onBlur`

### Solution 3: Improve Dropdown Touch Handling (MEDIUM PRIORITY)
**Problem it solves:** Dropdown items hard to tap

**What to do:**
```tsx
// Increase dropdown item padding/height to meet touch target minimum
// WCAG recommends 44x44px minimum touch target

// BEFORE:
<View className="px-4 py-3 border-b border-gray-100">

// AFTER:
<View className="px-4 py-4">  // Increased from py-3 to py-4 (16px to 20px)
  {/* Ensure minimum height of 44px */}
</View>
```

### Solution 4: Use GestureDetector for SVG Clicks (For USAMap - lower priority)
**Problem it solves:** Map state clicks are unreliable

**Current approach:**
- Uses SVG Path `onPress` with large invisible stroke (30px)
- This is inherently unreliable on mobile

**Better approach:**
- Keep using gesture-handler already implemented
- Ensure GestureHandlerRootView is present in app root
- Use TapGesture with hitSlop settings:

```tsx
const tapGesture = Gesture.Tap()
  .hitSlop(15)  // 15px touch zone around tap
  .onStart(() => {
    // Handle tap
  });
```

---

## Implementation Priority

### Phase 1: Quick Wins (Do First)
1. **Switch StateSearch dropdown items to Pressable** ✅ Highest impact, lowest effort
2. **Remove setTimeout race conditions** ✅ Removes timing issues
3. **Increase dropdown item height to 44px minimum** ✅ Larger touch target

**Expected Result:** Dropdown should work with single tap on mobile

### Phase 2: Polish (Do Later)
1. **Apply Pressable to USAMap state buttons**
2. **Verify GestureHandlerRootView is in app root** (check `app/_layout.tsx`)
3. **Test on real devices** (simulator vs physical device behavior differs)

---

## Key Statistics from Research

- **Minimum touch target:** 44x44px (WCAG standard)
- **Average finger width:** 10-15mm (~28-42px at 120 DPI)
- **Touch tolerance:** Most reliable apps use 20-30px hitSlop
- **Press detection timeout:** 500ms default (can be customized)
- **Race condition risk:** High when mixing setTimeout + press events

---

## Files to Modify

### Priority 1 (Immediate):
1. `components/ui/StateSearch.tsx` - Switch to Pressable, add hitSlop
2. Remove setTimeout from `handleSelectState`
3. Increase dropdown item minimum height

### Priority 2 (Follow-up):
1. `components/map/USAMap.tsx` - Apply similar hitSlop to state buttons
2. `app/_layout.tsx` - Verify GestureHandlerRootView setup

---

## Testing Checklist

- [ ] Test dropdown on physical iPhone
- [ ] Test dropdown on physical Android
- [ ] Test state clicks on physical iPhone
- [ ] Test state clicks on physical Android
- [ ] Verify single tap works (not 5+ taps)
- [ ] Verify web still works (mouse events)
- [ ] Verify no visual regressions

---

## Resources Used

1. React Native Handling Touches: https://reactnative.dev/docs/handling-touches
2. React Native Pressable: https://reactnative.dev/docs/pressable
3. react-native-gesture-handler: https://docs.swmansion.com/react-native-gesture-handler/
4. WCAG Touch Target Sizing: 44x44px minimum recommended
