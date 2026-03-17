import React, { useState } from 'react';
import { View, Text, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Line, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import type { ChartPoint, PresidentMarker } from '@/lib/services/economic';

interface MiniChartProps {
  points: ChartPoint[];
  height?: number;
  color?: string;
  unit?: string;
  presidentMarkers?: PresidentMarker[];
}

function formatAxisValue(value: number, unit?: string): string {
  if (unit === 'USD') return `$${(value / 1e12).toFixed(0)}T`;
  if (unit === '$/gal') return `$${value.toFixed(2)}`;
  if (unit === '%') return `${value.toFixed(1)}`;
  if (unit === 'index') return value.toFixed(0);
  return value.toFixed(1);
}

function formatDateLabel(dateStr: string, totalMonths: number): string {
  const d = new Date(dateStr);
  if (totalMonths > 24) {
    return `${d.getFullYear()}`;
  }
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}

interface Segment {
  presidentKey: string;
  shortName: string;
  party: 'R' | 'D';
  svgPoints: { x: number; y: number }[];
}

export function Sparkline({
  points,
  height = 90,
  color = '#3b82f6',
  unit,
  presidentMarkers,
}: MiniChartProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  if (!points || points.length < 2) return null;

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  if (containerWidth < 50) {
    return <View style={{ height }} onLayout={onLayout} />;
  }

  const width = containerWidth;

  // Detect multi-president mode
  const uniquePresidents = new Set(points.map((p) => p.president).filter(Boolean));
  const showPresidents = !!(
    presidentMarkers &&
    presidentMarkers.length > 0 &&
    uniquePresidents.size > 1
  );

  // Layout constants — extra top padding for president labels
  const leftPad = 42;
  const rightPad = 8;
  const topPad = showPresidents ? 20 : 6;
  const bottomPad = 18;
  const chartW = width - leftPad - rightPad;
  const chartH = height - topPad - bottomPad;

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const paddedMin = min - range * 0.05;
  const paddedMax = max + range * 0.05;
  const paddedRange = paddedMax - paddedMin;

  const svgPoints = points.map((p, i) => ({
    x: leftPad + (i / (points.length - 1)) * chartW,
    y: topPad + chartH - ((p.value - paddedMin) / paddedRange) * chartH,
  }));

  // Build segments (grouped by consecutive president key)
  const segments: Segment[] = [];
  if (showPresidents) {
    let current: Segment | null = null;
    points.forEach((p, i) => {
      const key = p.president ?? '';
      if (!current || key !== current.presidentKey) {
        const marker = presidentMarkers!.find((m) => m.key === key);
        current = {
          presidentKey: key,
          shortName: marker?.shortName ?? key,
          party: marker?.party ?? 'R',
          svgPoints: [svgPoints[i]],
        };
        segments.push(current);
      } else {
        current.svgPoints.push(svgPoints[i]);
      }
    });
  }

  // Build line/area paths
  let linePaths: string[];
  let areaPaths: string[];

  if (showPresidents && segments.length > 1) {
    linePaths = segments.map((seg) =>
      seg.svgPoints.map((p, j) => (j === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ')
    );
    areaPaths = segments.map((seg) => {
      const lp = seg.svgPoints
        .map((p, j) => (j === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
        .join(' ');
      return `${lp} L ${seg.svgPoints[seg.svgPoints.length - 1].x} ${topPad + chartH} L ${seg.svgPoints[0].x} ${topPad + chartH} Z`;
    });
  } else {
    const lp = svgPoints.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    linePaths = [lp];
    areaPaths = [
      `${lp} L ${svgPoints[svgPoints.length - 1].x} ${topPad + chartH} L ${svgPoints[0].x} ${topPad + chartH} Z`,
    ];
  }

  const gradId = `grad_${color.replace('#', '')}_${points.length}_${width}`;

  const yTicks = [paddedMax, (paddedMax + paddedMin) / 2, paddedMin];
  const yTickPositions = yTicks.map(
    (v) => topPad + chartH - ((v - paddedMin) / paddedRange) * chartH
  );

  const totalMonthSpan =
    points.length > 1
      ? Math.round(
          (new Date(points[points.length - 1].date).getTime() -
            new Date(points[0].date).getTime()) /
            (30.44 * 24 * 60 * 60 * 1000)
        )
      : 1;

  const xLabelIndices = [0, Math.floor(points.length / 2), points.length - 1];

  // Separator x positions (between segments)
  const separatorXs: number[] = [];
  if (showPresidents && segments.length > 1) {
    for (let i = 1; i < segments.length; i++) {
      separatorXs.push(segments[i].svgPoints[0].x);
    }
  }

  return (
    <View style={{ width: '100%', height }} onLayout={onLayout}>
      {/* President labels at top */}
      {showPresidents &&
        segments.map((seg, i) => {
          const midX = (seg.svgPoints[0].x + seg.svgPoints[seg.svgPoints.length - 1].x) / 2;
          const segWidth = seg.svgPoints[seg.svgPoints.length - 1].x - seg.svgPoints[0].x;
          // Skip label if segment is too narrow
          if (segWidth < 20) return null;
          return (
            <Text
              key={`pres-${i}`}
              numberOfLines={1}
              style={{
                position: 'absolute',
                left: midX - 28,
                top: 0,
                width: 56,
                textAlign: 'center',
                fontSize: 8,
                fontWeight: '700',
                color: seg.party === 'D' ? '#3b82f6' : '#ef4444',
              }}
            >
              {seg.shortName}
            </Text>
          );
        })}

      {/* Y-axis labels */}
      {yTicks.map((val, i) => (
        <Text
          key={`y-${i}`}
          style={{
            position: 'absolute',
            left: 0,
            top: yTickPositions[i] - 6,
            fontSize: 9,
            color: '#9ca3af',
            width: leftPad - 4,
            textAlign: 'right',
          }}
        >
          {formatAxisValue(val, unit)}
        </Text>
      ))}

      {/* X-axis labels */}
      {xLabelIndices.map((idx) => {
        if (idx >= points.length) return null;
        const xPos = leftPad + (idx / (points.length - 1)) * chartW;
        return (
          <Text
            key={`x-${idx}`}
            style={{
              position: 'absolute',
              top: topPad + chartH + 4,
              left: xPos - 20,
              width: 40,
              textAlign: 'center',
              fontSize: 8,
              color: '#9ca3af',
            }}
          >
            {formatDateLabel(points[idx].date, totalMonthSpan)}
          </Text>
        );
      })}

      {/* SVG Chart */}
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.25} />
            <Stop offset="1" stopColor={color} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {yTickPositions.map((y, i) => (
          <Line
            key={`grid-${i}`}
            x1={leftPad}
            y1={y}
            x2={leftPad + chartW}
            y2={y}
            stroke="#e5e7eb"
            strokeWidth={0.5}
            strokeDasharray="3,3"
          />
        ))}

        {/* President separator lines */}
        {separatorXs.map((x, i) => (
          <Line
            key={`sep-${i}`}
            x1={x}
            y1={topPad}
            x2={x}
            y2={topPad + chartH}
            stroke="#d1d5db"
            strokeWidth={0.8}
            strokeDasharray="3,2"
          />
        ))}

        {/* Area fills */}
        {areaPaths.map((path, i) => (
          <Path key={`area-${i}`} d={path} fill={`url(#${gradId})`} />
        ))}

        {/* Line paths */}
        {linePaths.map((path, i) => (
          <Path
            key={`line-${i}`}
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Latest point dot */}
        <Circle
          cx={svgPoints[svgPoints.length - 1].x}
          cy={svgPoints[svgPoints.length - 1].y}
          r={3}
          fill={color}
          stroke="#ffffff"
          strokeWidth={1.5}
        />
      </Svg>
    </View>
  );
}
