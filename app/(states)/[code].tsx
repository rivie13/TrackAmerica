import { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';

import { getStateInfo } from '@/lib/data/states';
import { ViewSelector, DistrictsView, SenatorsView } from '@/components';

type ViewMode = 'districts' | 'senators';

/**
 * State Detail Page
 * Route: /(states)/[code] -> accessible via /california, /texas, etc
 * Shows congressional districts or senators based on selected view
 *
 * This matches URLs like:
 * - /ca (California)
 * - /tx (Texas)
 * - /pa (Pennsylvania)
 */
export default function StateDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const stateCode = code?.toUpperCase();

  // View mode state (districts or senators)
  const [viewMode, setViewMode] = useState<ViewMode>('districts');

  // Get state metadata (name, political leaning, etc.)
  const stateInfo = stateCode ? getStateInfo(stateCode.toLowerCase()) : undefined;

  if (!stateInfo) {
    return (
      <>
        <Stack.Screen options={{ title: 'State Not Found' }} />
        <ScrollView className="flex-1 bg-white">
          <Animated.View entering={FadeIn} className="items-center justify-center py-8 px-4">
            <Text className="text-2xl font-bold text-red-600 text-center">
              State "{code}" not found
            </Text>
          </Animated.View>
        </ScrollView>
      </>
    );
  }

  // Convert TopoJSON to GeoJSON

  return (
    <>
      <Stack.Screen options={{ title: stateInfo.displayName }} />
      <ScrollView className="flex-1 bg-white">
        <View className="flex-1">
          {/* State Header */}
          <Animated.View entering={FadeIn} className="items-center justify-center py-6 px-4">
            <Text className="text-4xl font-bold text-gray-800 text-center">
              {stateInfo.displayName}
            </Text>
          </Animated.View>

          {/* View Selector: Districts vs Senators */}
          <View className="px-4 mb-4">
            <ViewSelector activeView={viewMode} onViewChange={setViewMode} />
          </View>

          {/* Conditional Rendering Based on View Mode */}
          <View className="flex-1 px-4">
            {viewMode === 'districts' && stateCode && <DistrictsView stateCode={stateCode} />}
            {viewMode === 'senators' && stateCode && <SenatorsView stateCode={stateCode} />}
          </View>

          {/* Future: Add more state-specific data here */}
        </View>
      </ScrollView>
    </>
  );
}
