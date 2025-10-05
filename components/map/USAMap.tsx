import React, { useState } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { useRouter } from 'expo-router';
import * as topojson from 'topojson-client';
import statesData from '../../assets/maps/states-albers-10m.json';

// State FIPS code to abbreviation mapping
const STATE_CODES: Record<string, string> = {
  '01': 'al',
  '02': 'ak',
  '04': 'az',
  '05': 'ar',
  '06': 'ca',
  '08': 'co',
  '09': 'ct',
  '10': 'de',
  '11': 'dc',
  '12': 'fl',
  '13': 'ga',
  '15': 'hi',
  '16': 'id',
  '17': 'il',
  '18': 'in',
  '19': 'ia',
  '20': 'ks',
  '21': 'ky',
  '22': 'la',
  '23': 'me',
  '24': 'md',
  '25': 'ma',
  '26': 'mi',
  '27': 'mn',
  '28': 'ms',
  '29': 'mo',
  '30': 'mt',
  '31': 'ne',
  '32': 'nv',
  '33': 'nh',
  '34': 'nj',
  '35': 'nm',
  '36': 'ny',
  '37': 'nc',
  '38': 'nd',
  '39': 'oh',
  '40': 'ok',
  '41': 'or',
  '42': 'pa',
  '44': 'ri',
  '45': 'sc',
  '46': 'sd',
  '47': 'tn',
  '48': 'tx',
  '49': 'ut',
  '50': 'vt',
  '51': 'va',
  '53': 'wa',
  '54': 'wv',
  '55': 'wi',
  '56': 'wy',
  '60': 'as',
  '66': 'gu',
  '69': 'mp',
  '72': 'pr',
  '78': 'vi',
};

interface USAMapProps {
  /** Optional CSS class name for styling */
  className?: string;
  /** Width of the map container */
  width?: number | string;
  /** Height of the map container */
  height?: number | string;
}

// Helper function to convert TopoJSON geometry to SVG path
function geoPath(geometry: any): string {
  if (!geometry || !geometry.coordinates) return '';

  const coordinates = geometry.coordinates;
  let path = '';

  const drawRing = (ring: any[]) => {
    return ring
      .map((point, i) => {
        const [x, y] = point;
        return `${i === 0 ? 'M' : 'L'}${x},${y}`;
      })
      .join('');
  };

  if (geometry.type === 'Polygon') {
    coordinates.forEach((ring: any[]) => {
      path += drawRing(ring) + 'Z';
    });
  } else if (geometry.type === 'MultiPolygon') {
    coordinates.forEach((polygon: any[]) => {
      polygon.forEach((ring: any[]) => {
        path += drawRing(ring) + 'Z';
      });
    });
  }

  return path;
}

/**
 * Interactive USA map component using react-native-svg
 *
 * Features:
 * - Clickable states that navigate to state detail pages using abbreviations (e.g., /ca, /tx)
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
    const stateCode = STATE_CODES[stateId];
    if (stateCode) {
      router.push(`/${stateCode}` as any);
    }
  };

  return (
    <View className={className} style={{ width: mapWidth, height: mapHeight }}>
      <Svg width="100%" height="100%" viewBox={viewBox}>
        <G>
          {geojson.features.map((feature: any) => {
            const stateId = feature.id;
            const isHovered = hoveredState === stateId;
            const pathData = geoPath(feature.geometry);

            return (
              <Path
                key={stateId}
                d={pathData}
                fill={isHovered ? '#3b82f6' : '#d6d6da'}
                stroke="#ffffff"
                strokeWidth={0.5}
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
