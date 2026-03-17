import React from 'react';
import { View, Pressable, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { getStateInfo } from '@/lib/data/states';

interface SmallStateButtonsProps {
  /** Optional CSS class name for styling */
  className?: string;
}

/**
 * SmallStateButtons Component
 *
 * Quick-access buttons for small/hard-to-click states on the USA map.
 * Makes it easier to navigate to these states on mobile and web.
 *
 * States included:
 * - Northeast: VT, NH, MA, RI, CT, NJ, DE, MD, DC
 * - Island: HI
 *
 * Features:
 * - Horizontal scrollable layout on mobile
 * - Compact grid layout on web
 * - Pressable with hitSlop for reliable touch detection
 * - Labeled state abbreviations
 * - NativeWind/Tailwind styling
 * - Works on web and mobile
 */
export function SmallStateButtons({ className }: SmallStateButtonsProps) {
  const router = useRouter();

  // Small/hard-to-click states (Northeast corridor + island states)
  const smallStates = ['vt', 'nh', 'ma', 'ri', 'ct', 'nj', 'de', 'md', 'dc', 'hi'];

  const handleStatePress = (stateCode: string) => {
    router.push(`/${stateCode}` as any);
  };

  return (
    <View className={`w-full ${className || ''}`}>
      {/* Section Title */}
      <Text className="text-sm font-semibold text-gray-700 mb-3 px-2">
        Small States (Quick Access)
      </Text>

      {/* Horizontal Scrollable Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEnabled={true}
        className="flex-row"
        contentContainerStyle={{ paddingHorizontal: 8, gap: 8 }}
      >
        {smallStates.map((stateCode) => {
          const stateInfo = getStateInfo(stateCode);
          if (!stateInfo) return null;

          return (
            <Pressable
              key={stateCode}
              onPress={() => handleStatePress(stateCode)}
              hitSlop={10}
              pressRetentionOffset={20}
              className="rounded-lg border border-gray-300 bg-white shadow-sm min-w-[70px]"
            >
              {({ pressed }) => (
                <View
                  style={{
                    backgroundColor: pressed ? '#3b82f6' : '#ffffff',
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  className="border border-gray-300"
                >
                  <Text
                    style={{ color: pressed ? '#ffffff' : '#1f2937' }}
                    className="text-sm font-bold"
                  >
                    {stateCode.toUpperCase()}
                  </Text>
                  <Text style={{ color: pressed ? '#ffffff' : '#6b7280' }} className="text-xs mt-1">
                    {stateInfo.displayName.split(' ')[0]}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
