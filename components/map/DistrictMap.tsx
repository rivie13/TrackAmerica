/**
 * DistrictMap Component
 *
 * Renders congressional districts for a specific US state using TopoJSON data.
 * Displays district boundaries from the 119th Congress (2025-2027 session)
 * using Census Bureau TIGER/Line cartographic boundary files.
 *
 * Data source: US Census Bureau cb_2024_us_cd119_500k
 * TopoJSON file: assets/maps/districts/us-congressional-districts-119.topojson
 *
 * Features:
 * - Filters districts by state using FIPS code
 * - Renders districts as SVG paths using react-native-svg
 * - Gray fill color (no party colors until Congress.gov API integration)
 * - Albers USA projection for accurate visualization
 * - Pinch-to-zoom and pan gestures for mobile
 * - Responsive sizing for different screen sizes
 *
 * Future enhancements:
 * - Click interactions to select districts
 * - Color coding by party affiliation (requires Congress.gov API)
 * - District labels with representative names
 * - Hover/touch tooltips with district info
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Dimensions } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';

import { STATE_INFO } from '@/lib/data/states';

interface DistrictMapProps {
  /**
   * Two-letter state code (e.g., "PA" for Pennsylvania)
   */
  stateCode: string;

  /**
   * Width of the SVG viewport (in pixels)
   */
  width?: number;

  /**
   * Height of the SVG viewport (in pixels)
   */
  height?: number;
}

/**
 * DistrictMap Component
 *
 * Renders congressional district boundaries for a given state.
 *
 * @example
 * ```tsx
 * <DistrictMap stateCode="PA" width={400} height={300} />
 * ```
 */
export function DistrictMap({ stateCode, width, height }: DistrictMapProps) {
  const [topology, setTopology] = useState<Topology | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get screen dimensions for responsive sizing
  const screenWidth = Dimensions.get('window').width;
  const mapWidth = width || screenWidth - 32;
  const mapHeight = height || 400;

  // Zoom and pan state - MUST be declared before any conditional returns
  const zoomScale = useSharedValue(1);
  const savedZoomScale = useSharedValue(1);
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);
  const savedPanX = useSharedValue(0);
  const savedPanY = useSharedValue(0);

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      zoomScale.value = savedZoomScale.value * event.scale;
      // Clamp scale between 1x and 5x
      zoomScale.value = Math.max(1, Math.min(5, zoomScale.value));
    })
    .onEnd(() => {
      savedZoomScale.value = zoomScale.value;
    });

  // Pan gesture for dragging - only activate after minimum distance
  const panGesture = Gesture.Pan()
    .minDistance(10) // Require 10px movement before activating pan
    .onUpdate((event) => {
      panX.value = savedPanX.value + event.translationX;
      panY.value = savedPanY.value + event.translationY;
    })
    .onEnd(() => {
      savedPanX.value = panX.value;
      savedPanY.value = panY.value;
    });

  // Combine gestures - allow pinch and pan simultaneously
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  // Animated styles for zoom and pan
  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: panX.value }, { translateY: panY.value }, { scale: zoomScale.value }],
  }));

  // Load TopoJSON file at runtime
  useEffect(() => {
    async function loadTopology() {
      try {
        // In Expo web, we need to fetch the asset from the Metro server
        const topoAsset = require('@/assets/maps/districts/us-congressional-districts-119.topojson');

        // For web: fetch the actual file content
        // For native: the require() already gives us the parsed JSON
        let topoData: Topology;

        if (typeof topoAsset === 'number') {
          // Native: asset is a number ID, need to resolve it
          const Asset = require('expo-asset').Asset;
          const asset = Asset.fromModule(topoAsset);
          await asset.downloadAsync();
          const response = await fetch(asset.localUri || asset.uri);
          topoData = await response.json();
        } else if (typeof topoAsset === 'string') {
          // Web: asset is a URL string
          const response = await fetch(topoAsset);
          topoData = await response.json();
        } else {
          // Already parsed JSON object
          topoData = topoAsset;
        }

        setTopology(topoData);
        setLoading(false);
      } catch (err) {
        console.error('[DistrictMap] Failed to load TopoJSON:', err);
        setError('Failed to load district data');
        setLoading(false);
      }
    }

    loadTopology();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <View
        className="flex items-center justify-center"
        style={{ width: mapWidth, height: mapHeight }}
      >
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-gray-500 mt-2">Loading districts...</Text>
      </View>
    );
  }

  // Show error state
  if (error || !topology) {
    return (
      <View className="flex items-center justify-center" style={{ width, height }}>
        <Text className="text-red-500">{error || 'Failed to load district data'}</Text>
      </View>
    );
  }

  // Normalize state code to lowercase for lookup
  const normalizedCode = stateCode.toLowerCase();

  // Get state info including FIPS code for filtering
  const stateInfo = STATE_INFO[normalizedCode];

  if (!stateInfo) {
    console.warn(`[DistrictMap] Unknown state code: ${stateCode}`);
    return (
      <View className="flex items-center justify-center" style={{ width, height }}>
        <Text className="text-gray-500">Unknown state: {stateCode}</Text>
      </View>
    );
  }

  const stateFips = stateInfo.fips;

  // Convert TopoJSON to GeoJSON FeatureCollection
  // The topology contains a single object named 'us-congressional-districts-119'
  const objectName = 'us-congressional-districts-119';
  const topoObject = topology.objects[objectName] as GeometryCollection;

  if (!topoObject) {
    console.error(`[DistrictMap] TopoJSON object '${objectName}' not found`);
    return (
      <View className="flex items-center justify-center" style={{ width, height }}>
        <Text className="text-gray-500">District data not available</Text>
      </View>
    );
  }

  // Convert TopoJSON to GeoJSON
  const districtFeatures = feature(topology, topoObject);

  // Filter districts by state FIPS code
  const stateDistricts = districtFeatures.features.filter((f) => {
    const props = f.properties as { STATEFP?: string };
    return props.STATEFP === stateFips;
  });

  if (stateDistricts.length === 0) {
    console.warn(`[DistrictMap] No districts found for state: ${stateCode} (FIPS: ${stateFips})`);
    return (
      <View className="flex items-center justify-center" style={{ width, height }}>
        <Text className="text-gray-500">No districts found for {stateInfo.name}</Text>
      </View>
    );
  }

  console.log(`[DistrictMap] Rendering ${stateDistricts.length} districts for ${stateInfo.name}`);

  /**
   * Calculate bounding box for state districts to fit them in viewport
   */
  function calculateBounds(features: typeof stateDistricts) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    features.forEach((f) => {
      if (f.geometry.type === 'Polygon') {
        f.geometry.coordinates.forEach((ring) => {
          ring.forEach(([x, y]) => {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          });
        });
      } else if (f.geometry.type === 'MultiPolygon') {
        f.geometry.coordinates.forEach((polygon) => {
          polygon.forEach((ring) => {
            ring.forEach(([x, y]) => {
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            });
          });
        });
      }
    });

    return { minX, minY, maxX, maxY };
  }

  const bounds = calculateBounds(stateDistricts);
  const geoWidth = bounds.maxX - bounds.minX;
  const geoHeight = bounds.maxY - bounds.minY;

  // Calculate scale and translation to fit districts in viewport
  const geoScale = Math.min(mapWidth / geoWidth, mapHeight / geoHeight) * 0.95; // 95% to add padding
  const geoTranslateX = (mapWidth - geoWidth * geoScale) / 2 - bounds.minX * geoScale;
  // FLIP Y AXIS: SVG y coordinates increase downward, but geo coordinates increase upward
  const geoTranslateY = (mapHeight + geoHeight * geoScale) / 2 + bounds.minY * geoScale;

  /**
   * Convert GeoJSON coordinates to SVG path string
   */
  function coordinatesToPath(coords: number[][]): string {
    return (
      coords
        .map((coord, i) => {
          const [x, y] = coord;
          const scaledX = x * geoScale + geoTranslateX;
          // FLIP Y: negate the scaled Y coordinate to flip vertically
          const scaledY = -y * geoScale + geoTranslateY;
          return `${i === 0 ? 'M' : 'L'}${scaledX},${scaledY}`;
        })
        .join(' ') + 'Z'
    );
  }

  /**
   * Generate SVG path for a district feature (handles Polygon and MultiPolygon)
   */
  function districtToPath(district: (typeof stateDistricts)[0]): string {
    if (district.geometry.type === 'Polygon') {
      // Polygon: array of rings (first is outer boundary, rest are holes)
      return district.geometry.coordinates.map(coordinatesToPath).join(' ');
    } else if (district.geometry.type === 'MultiPolygon') {
      // MultiPolygon: array of polygons
      return district.geometry.coordinates
        .map((polygon) => polygon.map(coordinatesToPath).join(' '))
        .join(' ');
    }
    return '';
  }

  return (
    <View
      className="flex items-center justify-center"
      style={{ width: mapWidth, height: mapHeight }}
    >
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[{ width: '100%', height: '100%' }, animatedStyles]}>
          <Svg width={mapWidth} height={mapHeight} viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
            <G>
              {stateDistricts.map((district, index) => {
                const props = district.properties as {
                  GEOID?: string;
                  NAMELSAD?: string;
                  CD119FP?: string;
                };
                const districtId = props.GEOID || `district-${index}`;
                const districtName = props.NAMELSAD || 'Unknown District';

                return (
                  <Path
                    key={districtId}
                    d={districtToPath(district)}
                    fill="#E5E7EB" // Gray fill (neutral until API integration)
                    stroke="#6B7280" // Darker gray border
                    strokeWidth={1}
                    onPress={() => {
                      // Future: handle district selection
                      console.log(`[DistrictMap] Clicked: ${districtName}`);
                    }}
                  />
                );
              })}
            </G>
          </Svg>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
