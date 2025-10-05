import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
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
  /** Filter to show only a specific state (e.g., 'PA', 'CA') */
  filterStateCode?: string;
}

/**
 * Interactive USA map component using react-native-svg
 *
 * Features:
 * - Clickable states that navigate to state detail pages using abbreviations (e.g., /ca, /tx)
 * - Color-coded by political leaning (red/blue/purple)
 * - Pinch-to-zoom and pan gestures for mobile
 * - Larger touch areas for small states
 * - Responsive container sizing
 * - Uses TopoJSON data from us-atlas
 * - Works on web AND mobile (Expo compatible)
 *
 * Future enhancements:
 * - Display congressional districts within states
 * - Show representative markers on districts
 */
export default function USAMap({ className, width, height = 500, filterStateCode }: USAMapProps) {
  const router = useRouter();
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Zoom and pan state
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // Convert TopoJSON to GeoJSON
  const geojson: any = topojson.feature(statesData as any, statesData.objects.states as any);

  // Filter features if filterStateCode is provided
  const features = filterStateCode
    ? geojson.features.filter((feature: any) => {
        const stateInfo = getStateByFips(feature.id);
        return stateInfo?.code.toLowerCase() === filterStateCode.toLowerCase();
      })
    : geojson.features;

  // Get screen dimensions for responsive sizing
  const screenWidth = Dimensions.get('window').width;
  const mapWidth = typeof width === 'number' ? width : screenWidth - 32;
  const mapHeight = typeof height === 'number' ? height : 500;

  // Calculate bounds for filtered state to zoom in properly
  let viewBox = '0 0 975 610';

  if (filterStateCode && features.length > 0) {
    // Calculate bounding box for the state
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    features.forEach((feature: any) => {
      const coords = feature.geometry.coordinates;

      const processCoords = (coordArray: any) => {
        if (typeof coordArray[0] === 'number') {
          // This is a coordinate pair
          minX = Math.min(minX, coordArray[0]);
          maxX = Math.max(maxX, coordArray[0]);
          minY = Math.min(minY, coordArray[1]);
          maxY = Math.max(maxY, coordArray[1]);
        } else {
          // This is an array of coordinates
          coordArray.forEach(processCoords);
        }
      };

      processCoords(coords);
    });

    // Add padding (20% on each side for better visibility)
    const boundsWidth = maxX - minX;
    const boundsHeight = maxY - minY;
    const paddingX = boundsWidth * 0.2;
    const paddingY = boundsHeight * 0.2;

    minX -= paddingX;
    maxX += paddingX;
    minY -= paddingY;
    maxY += paddingY;

    viewBox = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }

  const handleStatePress = (stateId: string) => {
    const stateInfo = getStateByFips(stateId);
    if (stateInfo) {
      router.push(`/${stateInfo.code}` as any);
    }
  };

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
      // Clamp scale between 1x and 5x
      scale.value = Math.max(1, Math.min(5, scale.value));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // Pan gesture for dragging - only activate after minimum distance
  const panGesture = Gesture.Pan()
    .minDistance(20) // Require 20px movement before activating pan (increased from 10 for better tap detection)
    .onUpdate((event) => {
      const newX = savedTranslateX.value + event.translationX;
      const newY = savedTranslateY.value + event.translationY;

      // Calculate bounds based on current scale
      // When zoomed in, allow more panning; when zoomed out, restrict panning
      const maxPan = (scale.value - 1) * 200; // Allow more panning when zoomed in

      // Clamp translation to prevent panning too far off screen
      translateX.value = Math.max(-maxPan, Math.min(maxPan, newX));
      translateY.value = Math.max(-maxPan, Math.min(maxPan, newY));
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // Combine gestures - pinch and pan simultaneously
  // Note: We don't add tap here because SVG Path elements handle their own onPress
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Animated styles for zoom and pan
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <View className={className} style={{ width: mapWidth, height: mapHeight }}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[{ width: '100%', height: '100%' }, animatedStyles]}>
          <Svg width="100%" height="100%" viewBox={viewBox} preserveAspectRatio="xMidYMid meet">
            <G>
              {features.map((feature: any) => {
                const stateId = feature.id;
                const stateInfo = getStateByFips(stateId);
                const isHovered = hoveredState === stateId;
                const pathData = geoPath(feature.geometry);

                // Get colors based on political leaning
                const colors = stateInfo
                  ? getStateColor(stateInfo.political)
                  : { fill: '#d6d6da', stroke: '#ffffff' };

                return (
                  <G key={stateId}>
                    {/* Invisible larger hit area for easier tapping */}
                    <Path
                      d={pathData}
                      fill="transparent"
                      stroke="transparent"
                      strokeWidth={30} // Large invisible stroke for better touch target (increased from 15)
                      onPress={() => handleStatePress(stateId)}
                      onPressIn={() => setHoveredState(stateId)}
                      onPressOut={() => setHoveredState(null)}
                    />
                    {/* Visible state path */}
                    <Path
                      d={pathData}
                      fill={isHovered ? '#60a5fa' : colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={2}
                      pointerEvents="none" // Let the invisible overlay handle touches
                    />
                  </G>
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
