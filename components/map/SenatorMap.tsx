/**
 * SenatorMap Component
 *
 * Displays the state outline colored by the sitting senators' parties.
 * - Same party both senators: solid party color
 * - Different parties: state split left/right — districts sorted by geographic
 *   centroid X; left half = senators[0] color, right half = senators[1] color
 *
 * Internal district lines are hidden (stroke = fill) so the shape renders as
 * two solid colored regions separated by a natural geographic boundary.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Dimensions } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';

import { STATE_INFO } from '@/lib/data/states';
import type { CongressMember } from '@/lib/types';

interface SenatorMapProps {
  stateCode: string;
  width?: number;
  height?: number;
  /** Up to 2 senators for the state */
  senators?: CongressMember[];
}

// Richer fills for a larger solid area feel
const SEN_FILL: Record<string, string> = {
  D: '#93c5fd',
  R: '#fca5a5',
  I: '#d8b4fe',
  '?': '#e5e7eb',
};
// Stroke matches fill → invisible internal district borders
const SEN_STROKE: Record<string, string> = {
  D: '#93c5fd',
  R: '#fca5a5',
  I: '#d8b4fe',
  '?': '#e5e7eb',
};

export function SenatorMap({ stateCode, width, height, senators }: SenatorMapProps) {
  const [topology, setTopology] = useState<Topology | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const screenWidth = Dimensions.get('window').width;
  const mapWidth = width ?? screenWidth - 32;
  const mapHeight = height ?? 280;

  useEffect(() => {
    let cancelled = false;
    async function loadTopology() {
      try {
        const topoAsset = require('@/assets/maps/districts/us-congressional-districts-119.topojson');
        let topoData: Topology;

        if (typeof topoAsset === 'number') {
          const Asset = require('expo-asset').Asset;
          const asset = Asset.fromModule(topoAsset);
          await asset.downloadAsync();
          const response = await fetch(asset.localUri || asset.uri);
          topoData = await response.json();
        } else if (typeof topoAsset === 'string') {
          const response = await fetch(topoAsset);
          topoData = await response.json();
        } else {
          topoData = topoAsset;
        }

        if (!cancelled) {
          setTopology(topoData);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load map data');
          setLoading(false);
        }
      }
    }
    loadTopology();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <View
        style={{
          width: mapWidth,
          height: mapHeight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (error || !topology) {
    return (
      <View
        style={{
          width: mapWidth,
          height: mapHeight,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#ef4444' }}>{error ?? 'Failed to load map'}</Text>
      </View>
    );
  }

  const normalizedCode = stateCode.toLowerCase();
  const stateInfo = STATE_INFO[normalizedCode];
  if (!stateInfo) return null;

  const objectName = 'us-congressional-districts-119';
  const topoObject = topology.objects[objectName] as GeometryCollection;
  if (!topoObject) return null;

  const districtFeatures = feature(topology, topoObject);
  const stateDistricts = districtFeatures.features.filter((f) => {
    const props = f.properties as { STATEFP?: string };
    return props.STATEFP === stateInfo.fips;
  });

  if (stateDistricts.length === 0) return null;

  // ── Bounding box ────────────────────────────────────────────────
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  function visitCoords(coords: number[][][]) {
    coords.forEach((ring) =>
      ring.forEach(([x, y]) => {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      })
    );
  }

  stateDistricts.forEach((f) => {
    if (f.geometry.type === 'Polygon') visitCoords(f.geometry.coordinates);
    else if (f.geometry.type === 'MultiPolygon') f.geometry.coordinates.forEach(visitCoords);
  });

  const geoWidth = maxX - minX;
  const geoHeight = maxY - minY;
  const geoScale = Math.min(mapWidth / geoWidth, mapHeight / geoHeight) * 0.95;
  const geoTranslateX = (mapWidth - geoWidth * geoScale) / 2 - minX * geoScale;
  const geoTranslateY = (mapHeight + geoHeight * geoScale) / 2 + minY * geoScale;

  function toSvgX(gx: number) {
    return gx * geoScale + geoTranslateX;
  }
  function toSvgY(gy: number) {
    return -gy * geoScale + geoTranslateY;
  }

  // ── Centroid X per district (used for the left/right split) ────
  const centroidXs = stateDistricts.map((d) => {
    const pts: number[][] = [];
    if (d.geometry.type === 'Polygon') {
      pts.push(...d.geometry.coordinates[0]);
    } else if (d.geometry.type === 'MultiPolygon') {
      const largest = d.geometry.coordinates.reduce((a, b) => (a[0].length > b[0].length ? a : b));
      pts.push(...largest[0]);
    }
    if (pts.length === 0) return (maxX + minX) / 2;
    const geoX = pts.reduce((sum, p) => sum + p[0], 0) / pts.length;
    return toSvgX(geoX);
  });

  // ── Determine party per district ────────────────────────────────
  const sen1 = senators?.[0];
  const sen2 = senators?.[1];
  const sameOrSingle = !sen1 || !sen2 || sen1.party === sen2.party;
  const unifiedParty = sameOrSingle ? (sen1?.party ?? '?') : null;

  // Split X = midpoint between the two centroid values closest to the median
  let splitX = (toSvgX(minX) + toSvgX(maxX)) / 2;
  if (!sameOrSingle) {
    const sorted = [...centroidXs].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    splitX = (sorted[mid - 1] + sorted[mid]) / 2;
  }

  function partyForDistrict(distIdx: number): string {
    if (sameOrSingle) return unifiedParty ?? '?';
    return centroidXs[distIdx] <= splitX ? (sen1?.party ?? '?') : (sen2?.party ?? '?');
  }

  // ── Path helpers ────────────────────────────────────────────────
  function coordsToPath(coords: number[][]): string {
    return (
      coords
        .map((coord, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(coord[0])},${toSvgY(coord[1])}`)
        .join(' ') + 'Z'
    );
  }

  function districtPath(d: (typeof stateDistricts)[0]): string {
    if (d.geometry.type === 'Polygon') return d.geometry.coordinates.map(coordsToPath).join(' ');
    if (d.geometry.type === 'MultiPolygon')
      return d.geometry.coordinates.map((poly) => poly.map(coordsToPath).join(' ')).join(' ');
    return '';
  }

  return (
    <View style={{ width: mapWidth, height: mapHeight }}>
      <Svg width={mapWidth} height={mapHeight} viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
        <G>
          {stateDistricts.map((district, idx) => {
            const party = partyForDistrict(idx);
            const fill = SEN_FILL[party] ?? '#e5e7eb';
            const stroke = SEN_STROKE[party] ?? fill;
            const props = district.properties as { GEOID?: string };
            return (
              <Path
                key={props.GEOID ?? `sd-${idx}`}
                d={districtPath(district)}
                fill={fill}
                stroke={stroke}
                strokeWidth={0.5}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}
