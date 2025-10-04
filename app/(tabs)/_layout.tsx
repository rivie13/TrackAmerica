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
        headerShown: true,
        headerTitle: 'TrackAmerica',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerShadowVisible: true,
      }}
    />
  );
}
