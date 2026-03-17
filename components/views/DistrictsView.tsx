/**
 * DistrictsView Component
 *
 * Displays congressional districts for a state, with real House member data
 * from the Congress.gov API below the district map.
 */

import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions } from 'react-native';

import { DistrictMap } from '@/components/map/DistrictMap';
import { RepCard } from '@/components/representatives/RepCard';
import { useHouseMembers } from '@/lib/hooks/useCongress';
import { STATE_INFO } from '@/lib/data/states';

interface DistrictsViewProps {
  stateCode: string;
}

export function DistrictsView({ stateCode }: DistrictsViewProps) {
  const normalizedCode = stateCode.toLowerCase();
  const stateInfo = STATE_INFO[normalizedCode];
  const { data: houseMembers, isLoading, isError, error } = useHouseMembers(stateCode);

  const screenWidth = Dimensions.get('window').width;
  const mapSize = Math.min(screenWidth - 32, 500);

  if (!stateInfo) {
    return (
      <View className="flex items-center justify-center p-6">
        <Text className="text-gray-500">Unknown state: {stateCode}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Congressional District Map */}
      <View className="items-center justify-center mb-4">
        <DistrictMap stateCode={stateCode.toUpperCase()} width={mapSize} height={mapSize} />
      </View>

      {/* House Members section */}
      <View className="px-4">
        <Text className="text-xl font-bold text-gray-900 mb-1">{stateInfo.name} House Members</Text>
        <Text className="text-sm text-gray-500 mb-5">
          US House of Representatives · 2-year terms
        </Text>

        {/* Loading */}
        {isLoading && (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-gray-400 text-sm mt-3">Loading representatives…</Text>
          </View>
        )}

        {/* Error */}
        {isError && (
          <View className="bg-red-50 rounded-2xl p-5">
            <Text className="text-red-700 font-semibold mb-1">Failed to load representatives</Text>
            <Text className="text-red-500 text-sm">
              {error instanceof Error ? error.message : 'Unknown error'}
            </Text>
            <Text className="text-gray-400 text-xs mt-2">
              Make sure EXPO_PUBLIC_CONGRESS_API_KEY is set in your .env file.
            </Text>
          </View>
        )}

        {/* Representatives list */}
        {houseMembers &&
          houseMembers.length > 0 &&
          houseMembers.map((member) => <RepCard key={member.bioguideId} member={member} />)}

        {/* Empty state */}
        {houseMembers && houseMembers.length === 0 && (
          <View className="items-center py-12">
            <Text className="text-gray-400 text-base">
              No house members found for {stateInfo.name}
            </Text>
          </View>
        )}

        {/* Attribution */}
        {houseMembers && (
          <Text className="text-xs text-gray-400 text-center mt-4">Data from Congress.gov API</Text>
        )}
      </View>
    </ScrollView>
  );
}
