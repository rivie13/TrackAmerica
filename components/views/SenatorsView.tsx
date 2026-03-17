/**
 * SenatorsView Component
 *
 * Displays current US Senators for a specific state using Congress.gov API.
 */

import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';

import { SenatorMap } from '@/components/map/SenatorMap';
import { RepCard } from '@/components/representatives/RepCard';
import { useSenators } from '@/lib/hooks/useCongress';
import { STATE_INFO } from '@/lib/data/states';

interface SenatorsViewProps {
  stateCode: string;
}

export function SenatorsView({ stateCode }: SenatorsViewProps) {
  const normalizedCode = stateCode.toLowerCase();
  const stateInfo = STATE_INFO[normalizedCode];
  const { data: senators, isLoading, isError, error } = useSenators(stateCode);

  if (!stateInfo) {
    return (
      <View className="flex items-center justify-center p-6">
        <Text className="text-gray-500">Unknown state: {stateCode}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 32 }}>
      {/* State map split by senator parties */}
      <View className="items-center justify-center mb-2">
        <SenatorMap
          stateCode={stateCode.toUpperCase()}
          width={Math.min(Dimensions.get('window').width - 32, 500)}
          height={260}
          senators={senators ?? []}
        />
      </View>

      <View className="px-4 pt-4">
        {/* Section header */}
        <Text className="text-xl font-bold text-gray-900 mb-1">{stateInfo.name} Senators</Text>
        <Text className="text-sm text-gray-500 mb-5">2 US Senators · 6-year terms</Text>

        {/* Loading */}
        {isLoading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-400 text-sm mt-3">Loading senators…</Text>
          </View>
        )}

        {/* Error */}
        {isError && (
          <View className="bg-red-50 rounded-2xl p-5">
            <Text className="text-red-700 font-semibold mb-1">Failed to load senators</Text>
            <Text className="text-red-500 text-sm">
              {error instanceof Error ? error.message : 'Unknown error'}
            </Text>
            <Text className="text-gray-400 text-xs mt-2">
              Make sure EXPO_PUBLIC_CONGRESS_API_KEY is set in your .env file.
            </Text>
          </View>
        )}

        {/* Senators list */}
        {senators &&
          senators.length > 0 &&
          senators.map((senator) => <RepCard key={senator.bioguideId} member={senator} />)}

        {/* Empty state */}
        {senators && senators.length === 0 && (
          <View className="items-center py-12">
            <Text className="text-gray-400 text-base">No senators found for {stateInfo.name}</Text>
          </View>
        )}

        {/* Attribution */}
        {senators && (
          <Text className="text-xs text-gray-400 text-center mt-4">Data from Congress.gov API</Text>
        )}
      </View>
    </ScrollView>
  );
}
