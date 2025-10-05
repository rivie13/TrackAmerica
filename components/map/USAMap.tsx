import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { useRouter } from 'expo-router';
import * as topojson from 'topojson-client';
import statesData from '@/assets/maps/states-albers-10m.json';
import { getStateByFips, getStateColor } from '@/lib/data/states';
import { geoPath } from '@/lib/utils/map-geometry';

interface USAMapProps {
  /** Optional CSS class name for styling */
  className?: string;
  /** Width of the map container */
  width?: number | string;
  /** Height of the map container */
  height?: number | string;
}

/**
 * Interactive USA map component using react-native-svg
 *
 * Features:
 * - Clickable states that navigate to state detail pages using abbreviations (e.g., /ca, /tx)
 * - Color-coded by political leaning (red/blue/purple)
 * - Hover effects for better UX
 * - Responsive container sizing
 * - Uses TopoJSON data from us-atlas
 * - Works on web AND mobile (Expo compatible)
 *
 * Future enhancements:
 * - Zoom to specific state on click
 * - Display congressional districts within states
 * - Show representative markers on districts
 */
export default function USAMap({ className, width, height = 500 }: USAMapProps) {
  const router = useRouter();
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Convert TopoJSON to GeoJSON
  const geojson: any = topojson.feature(statesData as any, statesData.objects.states as any);

  // Get screen dimensions for responsive sizing
  const screenWidth = Dimensions.get('window').width;
  const mapWidth = typeof width === 'number' ? width : screenWidth - 32;
  const mapHeight = typeof height === 'number' ? height : 500;

  // SVG viewBox matches the TopoJSON projection (975x610 for Albers USA)
  const viewBox = '0 0 975 610';

  const handleStatePress = (stateId: string) => {
    const stateInfo = getStateByFips(stateId);
    if (stateInfo) {
      router.push(`/${stateInfo.code}` as any);
    }
  };

  return (
    <View className={className} style={{ width: mapWidth, height: mapHeight }}>
      <Svg width="100%" height="100%" viewBox={viewBox}>
        <G>
          {geojson.features.map((feature: any) => {
            const stateId = feature.id;
            const stateInfo = getStateByFips(stateId);
            const isHovered = hoveredState === stateId;
            const pathData = geoPath(feature.geometry);

            // Get colors based on political leaning
            const colors = stateInfo
              ? getStateColor(stateInfo.political)
              : { fill: '#d6d6da', stroke: '#ffffff' };

            return (
              <Path
                key={stateId}
                d={pathData}
                fill={isHovered ? '#60a5fa' : colors.fill}
                stroke={colors.stroke}
                strokeWidth={0.75}
                onPress={() => handleStatePress(stateId)}
                onPressIn={() => setHoveredState(stateId)}
                onPressOut={() => setHoveredState(null)}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}
