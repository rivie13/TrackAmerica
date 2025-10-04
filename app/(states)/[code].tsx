import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

/**
 * State Detail Page
 * Route: /(states)/[code] -> accessible via /california, /texas, etc
 * Shows representatives, voting records, and other state-specific data
 *
 * This matches URLs like:
 * - /ca, /california (California)
 * - /tx, /texas (Texas)
 * - /ny, /newyork (New York)
 */
export default function StateDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();

  return (
    <View className="flex-1 bg-white items-center justify-center px-4">
      <Text className="text-2xl font-bold mb-2">State: {code?.toUpperCase()}</Text>
      <Text className="text-gray-600">Representatives and voting records will appear here</Text>
    </View>
  );
}
