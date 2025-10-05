import { ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import Animated, { ZoomIn, FadeIn } from 'react-native-reanimated';
import Svg, { Path, G } from 'react-native-svg';
import * as topojson from 'topojson-client';
import statesData from '@/assets/maps/states-albers-10m.json';
import { getStateInfo, getStateColor } from '@/lib/data/states';
import { geoPath, getGeometryBounds, createViewBox } from '@/lib/utils/map-geometry';

/**
 * State Detail Page
 * Route: /(states)/[code] -> accessible via /california, /texas, etc
 * Shows representatives, voting records, and other state-specific data
 *
 * This matches URLs like:
 * - /ca (California)
 * - /tx (Texas)
 * - /in (Indiana)
 */
export default function StateDetailScreen() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const stateCode = code?.toLowerCase();

  // Get state metadata (name, political leaning, etc.)
  const stateInfo = stateCode ? getStateInfo(stateCode) : undefined;

  if (!stateInfo) {
    return (
      <>
        <Stack.Screen options={{ title: 'State Not Found' }} />
        <ScrollView className="flex-1 bg-white">
          <Animated.View entering={FadeIn} className="items-center justify-center py-8 px-4">
            <Animated.Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#dc2626',
                textAlign: 'center',
              }}
            >
              State "{code}" not found
            </Animated.Text>
          </Animated.View>
        </ScrollView>
      </>
    );
  }

  // Get colors based on political leaning
  const colors = getStateColor(stateInfo.political);

  // Convert TopoJSON to GeoJSON
  const geojson: any = topojson.feature(statesData as any, statesData.objects.states as any);

  // Find the specific state feature by FIPS code
  const stateFeature = geojson.features.find((feature: any) => feature.id === stateInfo.fips);

  // Calculate viewBox to show only this state (with padding)
  const viewBox = stateFeature
    ? createViewBox(getGeometryBounds(stateFeature.geometry), 20)
    : '0 0 975 610';

  return (
    <>
      <Stack.Screen options={{ title: stateInfo.displayName }} />
      <ScrollView className="flex-1 bg-white">
        <Animated.View
          entering={ZoomIn.duration(500)}
          className="items-center justify-center py-8 px-4"
        >
          <Animated.Text
            entering={FadeIn.delay(300)}
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              marginBottom: 8,
              textAlign: 'center',
              color: colors.textColor,
            }}
          >
            {stateInfo.displayName}
          </Animated.Text>

          <Animated.Text
            entering={FadeIn.delay(350)}
            style={{
              fontSize: 18,
              color: '#9ca3af',
              marginBottom: 24,
              textAlign: 'center',
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            {stateInfo.code.toUpperCase()}
          </Animated.Text>

          {stateFeature && (
            <Svg width="100%" height={400} viewBox={viewBox}>
              <G>
                <Path
                  d={geoPath(stateFeature.geometry)}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={1.5}
                />
              </G>
            </Svg>
          )}

          <Animated.Text
            entering={FadeIn.delay(400)}
            style={{
              fontSize: 16,
              color: '#6b7280',
              marginTop: 24,
              textAlign: 'center',
              paddingHorizontal: 16,
            }}
          >
            Representatives and voting records will appear here
          </Animated.Text>
        </Animated.View>
      </ScrollView>
    </>
  );
}
