/**
 * DistrictsView Component
 *
 * Displays congressional districts for a specific US state.
 * Main view wrapper for the state detail page's "Districts" tab.
 *
 * Features:
 * - Shows congressional district boundaries using DistrictMap
 * - Future: district list with representative cards
 * - Future: click interactions to view district details
 *
 * Data source (planned): Congress.gov API for representative info
 */

import React from 'react';
import { View, Text, Dimensions } from 'react-native';

import { DistrictMap } from '@/components/map/DistrictMap';
import { STATE_INFO } from '@/lib/data/states';

interface DistrictsViewProps {
  /**
   * Two-letter state code (e.g., "PA" for Pennsylvania)
   */
  stateCode: string;
}

/**
 * DistrictsView Component
 *
 * Displays congressional districts and representatives for a state.
 *
 * @example
 * ```tsx
 * <DistrictsView stateCode="PA" />
 * ```
 */
export function DistrictsView({ stateCode }: DistrictsViewProps) {
  const normalizedCode = stateCode.toLowerCase();
  const stateInfo = STATE_INFO[normalizedCode];

  // Get screen dimensions for responsive map sizing
  const screenWidth = Dimensions.get('window').width;
  const mapSize = Math.min(screenWidth - 32, 500); // Max 500px, with 32px padding

  if (!stateInfo) {
    return (
      <View className="flex items-center justify-center p-6">
        <Text className="text-gray-500">Unknown state: {stateCode}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {/* Congressional District Map */}
      <View className="items-center justify-center mb-6">
        <DistrictMap stateCode={stateCode.toUpperCase()} width={mapSize} height={mapSize} />
      </View>

      {/* Future: Representative cards for each district */}
      <View className="px-4">
        <Text className="text-sm text-gray-500 text-center">
          District representatives coming soon...
        </Text>
      </View>
    </View>
  );
}
