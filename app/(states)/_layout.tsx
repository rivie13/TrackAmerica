import { Stack } from 'expo-router';

/**
 * Layout for (states) route group
 * Handles state detail pages like /california, /texas, etc
 * Uses Stack navigator to allow back navigation to home
 */
export default function StatesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
        headerTintColor: '#f4511e',
      }}
    />
  );
}
