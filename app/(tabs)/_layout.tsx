import { Stack } from 'expo-router';

/**
 * Layout for (tabs) route group
 * Currently using Stack navigator - will be converted to Tabs in Phase 2
 * when we add actual tab-based navigation (Home, Search, Profile, etc)
 */
export default function TabsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // We'll add custom headers per-screen if needed
      }}
    />
  );
}
