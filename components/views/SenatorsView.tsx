/**
 * SenatorsView Component
 *
 * Displays US Senators for a specific state.
 *
 * Features (planned):
 * - State shape outline (reuse from existing states TopoJSON)
 * - Senator cards with names, party affiliation, photos
 * - Contact information (office, phone, email)
 * - Voting records and bill sponsorships
 * - Term dates and next election info
 *
 * Current implementation: Placeholder view with state district map
 * Data source (planned): Congress.gov API
 */

import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';

import USAMap from '@/components/map/USAMap';
import { STATE_INFO } from '@/lib/data/states';

interface SenatorsViewProps {
  /**
   * Two-letter state code (e.g., "PA" for Pennsylvania)
   */
  stateCode: string;
}

/**
 * SenatorsView Component (Placeholder)
 *
 * Shows state district map and placeholder senator information.
 * Will display full senator data when Congress.gov API is integrated.
 *
 * @example
 * ```tsx
 * <SenatorsView stateCode="PA" />
 * ```
 */
export function SenatorsView({ stateCode }: SenatorsViewProps) {
  const normalizedCode = stateCode.toLowerCase();
  const stateInfo = STATE_INFO[normalizedCode];

  // Get screen dimensions for responsive map sizing
  const screenWidth = Dimensions.get('window').width;
  const mapWidth = Math.min(screenWidth - 32, 500); // Max 500px, with 32px padding
  const mapHeight = Math.min((screenWidth - 32) * 0.75, 375); // 3:4 aspect ratio

  if (!stateInfo) {
    return (
      <View className="flex items-center justify-center p-6">
        <Text className="text-gray-500">Unknown state: {stateCode}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="items-center justify-center p-6">
        {/* State Outline Map - using existing USAMap component */}
        <View className="mb-6">
          <USAMap width={mapWidth} height={mapHeight} filterStateCode={stateCode} />
        </View>

        {/* Senator Information Header */}
        <Text className="text-2xl font-bold text-gray-900 mb-4 text-center">
          {stateInfo.name} Senators
        </Text>

        {/* Placeholder Content */}
        <View className="bg-gray-50 rounded-lg p-6 max-w-md">
          <Text className="text-gray-700 text-center mb-4">Senator information coming soon</Text>

          <Text className="text-gray-600 text-sm mb-2">Future enhancements:</Text>
          <Text className="text-gray-600 text-sm">• Senator names and party affiliation</Text>
          <Text className="text-gray-600 text-sm">• Photos and contact information</Text>
          <Text className="text-gray-600 text-sm">• Voting records and bill sponsorships</Text>
          <Text className="text-gray-600 text-sm">• Term dates and next election info</Text>

          <Text className="text-gray-500 text-xs mt-4 text-center">
            Data source: Congress.gov API (planned)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
