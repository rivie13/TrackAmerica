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

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Path, G, Rect } from 'react-native-svg';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  SharedValue,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';

import { STATE_INFO } from '@/lib/data/states';
import type { CongressMember } from '@/lib/types';

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

  /**
   * Optional house members — enables party coloring and rep pins
   */
  members?: CongressMember[];
}

// ─── Party colour constants ──────────────────────────────────────────────────

/** Light tint fill per party */
const PARTY_FILL: Record<string, string> = {
  D: '#bfdbfe',
  R: '#fecaca',
  I: '#e9d5ff',
};
/** Border stroke per party */
const PARTY_STROKE: Record<string, string> = {
  D: '#3b82f6',
  R: '#ef4444',
  I: '#a855f7',
};
/** Vivid pin circle colour per party */
const PARTY_PIN_COLOR: Record<string, string> = {
  D: '#1d4ed8',
  R: '#b91c1c',
  I: '#7c3aed',
};
const PARTY_COLORS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  D: { bg: '#dbeafe', text: '#1d4ed8', label: 'Democrat' },
  R: { bg: '#fee2e2', text: '#b91c1c', label: 'Republican' },
  I: { bg: '#f3e8ff', text: '#7c3aed', label: 'Independent' },
};

// ─── Pin popup types & component ─────────────────────────────────────────────

const POPUP_WIDTH = 200;
// Estimated card height used for positioning above the pin
const POPUP_CARD_H = 156;

interface PopupProps {
  member: CongressMember;
  onClose: () => void;
  onViewProfile: (bioguideId: string) => void;
}

/**
 * Popup card content only — no positioning.
 * Positioning is handled by the parent via an Animated.View driven by
 * live Reanimated shared values so the card always tracks its pin.
 */
function DistrictPinPopup({ member, onClose, onViewProfile }: PopupProps) {
  const colors = PARTY_COLORS_BADGE[member.party] ?? {
    bg: '#f1f5f9',
    text: '#475569',
    label: member.party,
  };
  const initials = (member.firstName?.[0] ?? '') + (member.lastName?.[0] ?? '');
  const subtitle =
    member.chamber === 'Senate'
      ? `Senator · ${member.state}`
      : `District ${member.district ?? '?'} · ${member.state}`;

  return (
    <View
      style={{
        width: POPUP_WIDTH,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
      }}
    >
      {/* Header row: avatar · info · close button (all in-flow, no absolute positioning) */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 }}>
        {/* Avatar */}
        {member.photoUrl ? (
          <Image
            source={{ uri: member.photoUrl }}
            style={{ width: 40, height: 40, borderRadius: 20, marginRight: 8, flexShrink: 0 }}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.bg,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 8,
              flexShrink: 0,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: colors.text }}>{initials}</Text>
          </View>
        )}

        {/* Name / subtitle / party badge */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#111827' }} numberOfLines={2}>
            {member.firstName} {member.lastName}
          </Text>
          <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{subtitle}</Text>
          <View
            style={{
              marginTop: 3,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 8,
              backgroundColor: colors.bg,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: colors.text }}>
              {colors.label}
            </Text>
          </View>
        </View>

        {/*
         * Close button — placed here in the normal document flow so its
         * rendered position always matches its DOM hit area. An absolutely
         * positioned button inside a transformed ancestor can have its
         * visual position differ from the browser's hit-test position.
         */}
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: '#e5e7eb',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 6,
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 14, color: '#374151', fontWeight: '800', lineHeight: 16 }}>
            ✕
          </Text>
        </Pressable>
      </View>

      {/* View full profile button */}
      <Pressable
        onPress={() => onViewProfile(member.bioguideId)}
        style={{
          backgroundColor: '#1d4ed8',
          borderRadius: 8,
          paddingVertical: 6,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>View Full Profile →</Text>
      </Pressable>
    </View>
  );
}

// ─── AnimatedPin ─────────────────────────────────────────────────────────────

const PIN_D = 22;

interface AnimatedPinProps {
  member: CongressMember;
  /** Pin centre x in SVG viewport coordinates */
  cx: number;
  /** Pin centre y in SVG viewport coordinates */
  cy: number;
  isActive: boolean;
  onActivate: () => void;
  /** Current map zoom level — pin counter-scales by 1/zoom to stay constant screen size */
  zoomScale: SharedValue<number>;
}

function AnimatedPin({ member, cx, cy, isActive, onActivate, zoomScale }: AnimatedPinProps) {
  const scale = useSharedValue(1);
  const lift = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.75 : 1, { damping: 12, stiffness: 220 });
    lift.value = withSpring(isActive ? -10 : 0, { damping: 12, stiffness: 220 });
  }, [isActive, scale, lift]);

  const animStyle = useAnimatedStyle(() => ({
    // scale.value handles the active-pop spring.
    // Dividing by zoomScale.value cancels the parent Animated.View's zoom so
    // every pin keeps a constant apparent size on screen as the map zooms in.
    transform: [{ translateY: lift.value }, { scale: scale.value / zoomScale.value }],
    zIndex: isActive ? 20 : 2,
  }));

  const pinColor = PARTY_PIN_COLOR[member.party] ?? '#6b7280';

  // Web: show popup on mouse enter; Mobile: show popup on press
  const webHoverProps = Platform.OS === 'web' ? ({ onMouseEnter: onActivate } as object) : {};

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: cx - PIN_D / 2,
          top: cy - PIN_D / 2,
          width: PIN_D,
          height: PIN_D,
        },
        animStyle,
      ]}
    >
      <Pressable
        onPress={onActivate}
        {...webHoverProps}
        accessibilityRole="button"
        accessibilityLabel={`${member.firstName} ${member.lastName}`}
        style={{
          width: PIN_D,
          height: PIN_D,
          borderRadius: PIN_D / 2,
          backgroundColor: pinColor,
          borderWidth: 3,
          borderColor: 'white',
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 5,
          shadowOffset: { width: 0, height: 2 },
          elevation: 5,
        }}
      />
    </Animated.View>
  );
}

/**
 * DistrictMap Component
 *
 * Renders congressional district boundaries for a given state.
 * When `members` is provided, districts are coloured by party and animated
 * pins are shown at each district centroid. Hover (web) or tap (mobile) a pin
 * to raise it with a spring animation and see a popup with rep info.
 *
 * @example
 * ```tsx
 * <DistrictMap stateCode="PA" width={400} height={300} members={houseMembers} />
 * ```
 */
export function DistrictMap({ stateCode, width, height, members }: DistrictMapProps) {
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

  // Active pin — stores the member + its raw SVG centroid coords.
  // Coords are also mirrored into shared values so popupAnimStyle can
  // recompute the popup's screen position every frame during pan/zoom.
  const [activePin, setActivePin] = useState<{
    member: CongressMember;
    cx: number;
    cy: number;
  } | null>(null);
  const activePinCxSV = useSharedValue(-9999);
  const activePinCySV = useSharedValue(-9999);
  const router = useRouter();
  // Container ref for web wheel-zoom event listener
  const containerRef = useRef<View>(null);

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
    .minDistance(20) // Require 20px movement before activating pan (increased from 10 for better tap detection)
    .onUpdate((event) => {
      const newX = savedPanX.value + event.translationX;
      const newY = savedPanY.value + event.translationY;

      // Calculate bounds based on current scale
      // When zoomed in, allow more panning; when zoomed out, restrict panning
      const maxPan = Math.max(0, (zoomScale.value - 1) * Math.max(mapWidth, mapHeight) * 0.6);

      // Clamp translation to prevent panning too far off screen
      panX.value = Math.max(-maxPan, Math.min(maxPan, newX));
      panY.value = Math.max(-maxPan, Math.min(maxPan, newY));
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

  // Popup position — recomputed every frame from live transform shared values
  // so the card always stays anchored above its pin during pan and zoom.
  const popupAnimStyle = useAnimatedStyle(() => {
    const vcx = mapWidth / 2;
    const vcy = mapHeight / 2;
    const viewX = vcx + (activePinCxSV.value - vcx) * zoomScale.value + panX.value;
    const viewY = vcy + (activePinCySV.value - vcy) * zoomScale.value + panY.value;
    const left = Math.max(4, Math.min(mapWidth - POPUP_WIDTH - 4, viewX - POPUP_WIDTH / 2));
    const top = Math.max(4, Math.min(mapHeight - POPUP_CARD_H - 4, viewY - POPUP_CARD_H - 8));
    return { left, top };
  });

  // ─── Zoom helpers (shared by buttons and wheel handler) ─────────────────────

  /** Apply a new absolute scale, clamping pan to keep the map on screen. */
  const applyZoom = (newScale: number) => {
    const s = Math.max(1, Math.min(5, newScale));
    const maxPan = Math.max(0, (s - 1) * Math.max(mapWidth, mapHeight) * 0.6);
    zoomScale.value = s;
    savedZoomScale.value = s;
    const cpx = Math.max(-maxPan, Math.min(maxPan, panX.value));
    const cpy = Math.max(-maxPan, Math.min(maxPan, panY.value));
    panX.value = cpx;
    savedPanX.value = cpx;
    panY.value = cpy;
    savedPanY.value = cpy;
  };

  const zoomIn = () => applyZoom(savedZoomScale.value * 1.6);
  const zoomOut = () => applyZoom(savedZoomScale.value / 1.6);

  const closePopup = () => {
    setActivePin(null);
    activePinCxSV.value = -9999;
    activePinCySV.value = -9999;
  };

  const resetZoom = () => {
    zoomScale.value = 1;
    savedZoomScale.value = 1;
    panX.value = 0;
    savedPanX.value = 0;
    panY.value = 0;
    savedPanY.value = 0;
  };

  // Web-only: non-passive wheel listener so e.preventDefault() actually blocks page scroll.
  // The effect depends on `topology` so it re-runs once the map finishes loading and
  // containerRef.current is attached to the DOM — the previous mount-only attempt always
  // found containerRef.current === null because the loading indicator was rendered instead.
  useEffect(() => {
    if (Platform.OS !== 'web' || !topology) return;
    const el = containerRef.current as unknown as HTMLElement | null;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mxRel = e.clientX - rect.left - mapWidth / 2;
      const myRel = e.clientY - rect.top - mapHeight / 2;
      const factor = e.deltaY > 0 ? 0.85 : 1.18;
      const oldScale = savedZoomScale.value;
      const newScale = Math.max(1, Math.min(5, oldScale * factor));
      const ratio = newScale / oldScale;
      const newTx = mxRel - (mxRel - savedPanX.value) * ratio;
      const newTy = myRel - (myRel - savedPanY.value) * ratio;
      const maxPan = Math.max(0, (newScale - 1) * Math.max(mapWidth, mapHeight) * 0.6);
      zoomScale.value = newScale;
      savedZoomScale.value = newScale;
      panX.value = Math.max(-maxPan, Math.min(maxPan, newTx));
      savedPanX.value = panX.value;
      panY.value = Math.max(-maxPan, Math.min(maxPan, newTy));
      savedPanY.value = panY.value;
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topology, mapWidth, mapHeight]);

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

  // Build district-number → member map for colour & pin rendering
  const districtMemberMap = new Map<number, CongressMember>();
  if (members && members.length > 0) {
    for (const m of members) {
      if (m.district != null) {
        districtMemberMap.set(m.district, m);
      }
    }
  }

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

  /** Returns the SVG viewport centroid {x, y} for a district */
  function computeDistrictCentroid(district: (typeof stateDistricts)[0]): { x: number; y: number } {
    const pts: number[][] = [];
    if (district.geometry.type === 'Polygon') {
      pts.push(...district.geometry.coordinates[0]);
    } else if (district.geometry.type === 'MultiPolygon') {
      const largest = district.geometry.coordinates.reduce((a, b) =>
        a[0].length > b[0].length ? a : b
      );
      pts.push(...largest[0]);
    }
    if (pts.length === 0) return { x: 0, y: 0 };
    const geoX = pts.reduce((sum, p) => sum + p[0], 0) / pts.length;
    const geoY = pts.reduce((sum, p) => sum + p[1], 0) / pts.length;
    return {
      x: geoX * geoScale + geoTranslateX,
      y: -geoY * geoScale + geoTranslateY,
    };
  }

  // Build pin data array (done after centroid helper is defined)
  const pinData: Array<{ member: CongressMember; cx: number; cy: number }> = [];
  stateDistricts.forEach((district) => {
    const dProps = district.properties as { CD119FP?: string };
    const districtNum = dProps.CD119FP ? parseInt(dProps.CD119FP, 10) : null;
    const pinMember = districtNum != null ? districtMemberMap.get(districtNum) : undefined;
    if (pinMember) {
      const { x, y } = computeDistrictCentroid(district);
      pinData.push({ member: pinMember, cx: x, cy: y });
    }
  });

  const ZOOM_BTNS = [
    { label: '+', onPress: zoomIn, a11y: 'Zoom in' },
    { label: '−', onPress: zoomOut, a11y: 'Zoom out' },
    { label: '⟲', onPress: resetZoom, a11y: 'Reset zoom' },
  ] as const;

  return (
    <View
      ref={containerRef}
      style={{ position: 'relative', width: mapWidth, height: mapHeight, overflow: 'hidden' }}
    >
      {/* Gesture-controlled zoomed/panned map */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[{ width: mapWidth, height: mapHeight }, animatedStyles]}>
          <Svg width={mapWidth} height={mapHeight} viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
            <G>
              {/* Tapping empty map space dismisses the popup */}
              <Rect
                x={0}
                y={0}
                width={mapWidth}
                height={mapHeight}
                fill="transparent"
                onPress={closePopup}
              />
              {stateDistricts.map((district, index) => {
                const props = district.properties as { GEOID?: string; CD119FP?: string };
                const districtId = props.GEOID || `district-${index}`;
                const districtNum = props.CD119FP ? parseInt(props.CD119FP, 10) : null;
                const member = districtNum != null ? districtMemberMap.get(districtNum) : undefined;
                const fillColor = member ? (PARTY_FILL[member.party] ?? '#E5E7EB') : '#E5E7EB';
                const strokeColor = member ? (PARTY_STROKE[member.party] ?? '#6B7280') : '#6B7280';
                return (
                  <Path
                    key={districtId}
                    d={districtToPath(district)}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={1}
                  />
                );
              })}
            </G>
          </Svg>

          {/*
           * Pin layer — inside Animated.View so pins zoom/pan with the map.
           * pointerEvents="box-none" lets unhandled gestures fall through
           * to the GestureDetector below.
           */}
          <View
            style={{ position: 'absolute', top: 0, left: 0, width: mapWidth, height: mapHeight }}
            pointerEvents="box-none"
          >
            {pinData.map(({ member, cx, cy }) => (
              <AnimatedPin
                key={member.bioguideId}
                member={member}
                cx={cx}
                cy={cy}
                zoomScale={zoomScale}
                isActive={activePin?.member.bioguideId === member.bioguideId}
                onActivate={() => {
                  // Store raw SVG coords in shared values — popupAnimStyle
                  // will project them to screen space every frame.
                  activePinCxSV.value = cx;
                  activePinCySV.value = cy;
                  setActivePin({ member, cx, cy });
                }}
              />
            ))}
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Popup — outside the transform, positioned by popupAnimStyle which
          recalculates left/top every frame from live zoomScale/panX/panY
          shared values, so the card always tracks its pin. */}
      {activePin && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              zIndex: 20,
            },
            popupAnimStyle,
          ]}
        >
          <DistrictPinPopup
            member={activePin.member}
            onClose={closePopup}
            onViewProfile={(bioguideId) => {
              closePopup();
              router.push(`/rep/${bioguideId}` as Parameters<typeof router.push>[0]);
            }}
          />
        </Animated.View>
      )}

      {/* Web zoom buttons — only shown on web; outside GestureDetector so they get normal clicks */}
      {Platform.OS === 'web' && (
        <View
          style={{ position: 'absolute', bottom: 12, right: 12, zIndex: 30, gap: 6 }}
          pointerEvents="box-none"
        >
          {ZOOM_BTNS.map(({ label, onPress, a11y }) => (
            <Pressable
              key={label}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={a11y}
              style={({ pressed }: { pressed: boolean }) => ({
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: pressed ? '#e5e7eb' : 'white',
                borderWidth: 1,
                borderColor: '#d1d5db',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 1 },
              })}
            >
              <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', lineHeight: 20 }}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
