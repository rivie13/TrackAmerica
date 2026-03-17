// Working Class Economic Health Score
// Composite index from 7 government data sources — no political bias

import React, { useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, LayoutChangeEvent } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import type { ChartPoint, IndicatorData } from '@/lib/services/economic';

interface Props {
  cpi?: IndicatorData; // headline CPI — used only for real-wage calc
  coreCpi?: IndicatorData; // core CPI (ex-food, ex-energy) — used for inflation score
  unemployment?: IndicatorData; // U-3 official rate
  unemployment6?: IndicatorData; // U-6 broad rate (more weight)
  gasPrice?: IndicatorData;
  foodCpi?: IndicatorData;
  shelterCpi?: IndicatorData;
  wageGrowth?: IndicatorData;
  isLoading?: boolean;
  delay?: number;
}

interface ScoreComponent {
  label: string;
  score: number; // 0–100 normalized
  value: string; // human-readable raw value
}

// ── Scoring functions (100 = best for working class, 0 = worst) ──

// Core CPI YoY%: Fed's 2% target is optimal.
// Below 2% (disinflation/deflation) is bad; above 2% (inflation) is bad.
// 2%=100, 0%=75, −4%=0, 5%=62, 10%=0
function scoreCPI(pct: number): number {
  if (pct >= 2) return Math.max(0, 100 - ((pct - 2) / 8) * 100);
  if (pct >= 0) return 75 + (pct / 2) * 25;
  return Math.max(0, 75 + (pct / 4) * 75);
}

// U-3 official unemployment: 3%=100, 15%=0
function scoreUnemployment(pct: number): number {
  return Math.max(0, Math.min(100, ((15 - pct) / 12) * 100));
}

// U-6 broad unemployment (includes discouraged + involuntary part-time): 7%=100, 28%=0
function scoreUnemploymentU6(pct: number): number {
  return Math.max(0, Math.min(100, ((28 - pct) / 21) * 100));
}

// Gas price $/gal: $2=100, $5=0
function scoreGasPrice(price: number): number {
  return Math.max(0, Math.min(100, ((5 - price) / 3) * 100));
}

// Food CPI YoY%: 0% optimal. Deflation penalized (signals distress beyond -6%).
// 0%=100, −2%=67, −6%=0, 3%=70, 5%=50, 10%=0
function scoreFoodCPI(pct: number): number {
  if (pct >= 0) return Math.max(0, 100 - (pct / 10) * 100);
  return Math.max(0, 100 + (pct / 6) * 100);
}

// Shelter CPI YoY%: same logic as food
// 0%=100, −2%=67, −6%=0, 3%=70, 5%=50, 10%=0
function scoreShelterCPI(pct: number): number {
  if (pct >= 0) return Math.max(0, 100 - (pct / 10) * 100);
  return Math.max(0, 100 + (pct / 6) * 100);
}

// Real wage growth (wages minus CPI): +3%=100, 0%=62, −5%=0
function scoreRealWage(wagePct: number, cpiPct: number): number {
  const real = wagePct - cpiPct;
  return Math.max(0, Math.min(100, ((real + 5) / 8) * 100));
}

// ── Composite weights ─────────────────────────────────────────────
// [coreCPI, u3, u6, gas, food, shelter, realWage] — must sum to 1.0
// U-6 outweighs U-3 because it better captures true labor market stress
const WEIGHTS = [0.2, 0.08, 0.12, 0.15, 0.15, 0.15, 0.15] as const;

function composite(
  coreCpiVal: number,
  u3Val: number,
  u6Val: number,
  gasVal: number,
  foodVal: number,
  shelterVal: number,
  wageVal: number,
  cpiVal: number
): number {
  return (
    scoreCPI(coreCpiVal) * WEIGHTS[0] +
    scoreUnemployment(u3Val) * WEIGHTS[1] +
    scoreUnemploymentU6(u6Val) * WEIGHTS[2] +
    scoreGasPrice(gasVal) * WEIGHTS[3] +
    scoreFoodCPI(foodVal) * WEIGHTS[4] +
    scoreShelterCPI(shelterVal) * WEIGHTS[5] +
    scoreRealWage(wageVal, cpiVal) * WEIGHTS[6]
  );
}

// ── Labels / colors ───────────────────────────────────────────────

function getStatusLabel(score: number): string {
  if (score >= 75) return 'STRONG';
  if (score >= 55) return 'MODERATE';
  if (score >= 35) return 'STRAINED';
  return 'STRUGGLING';
}

function getColor(score: number): string {
  if (score >= 75) return '#16a34a';
  if (score >= 55) return '#ca8a04';
  if (score >= 35) return '#ea580c';
  return '#dc2626';
}

function getTrendInfo(delta: number): { text: string; arrow: string; color: string } {
  if (delta > 4) return { text: 'Improving', arrow: '\u2191', color: '#16a34a' };
  if (delta < -4) return { text: 'Worsening', arrow: '\u2193', color: '#dc2626' };
  return { text: 'Stable', arrow: '\u2192', color: '#ca8a04' };
}

function buildSummary(score: number, components: ScoreComponent[], trendDelta: number): string {
  const trend = getTrendInfo(trendDelta);
  const sorted = [...components].sort((a, b) => a.score - b.score);
  const worst = sorted[0];
  const best = sorted[sorted.length - 1];
  const label = getStatusLabel(score).toLowerCase();
  const trendPhrase =
    trend.text === 'Stable'
      ? 'conditions have been relatively stable'
      : `conditions have been ${trend.text.toLowerCase()}`;
  return `Working class economic conditions are ${label}. Over the last 6 months, ${trendPhrase}. The biggest pressure is ${worst.label.toLowerCase()} (${worst.value}), while ${best.label.toLowerCase()} (${best.value}) is the strongest indicator.`;
}

// ── Period types / historical score chart ─────────────────────────

type Period = '6mo' | '1yr' | '2yr' | '3yr' | '5yr' | '10yr';

const PERIOD_LABELS: Record<Period, string> = {
  '6mo': '6M',
  '1yr': '1Y',
  '2yr': '2Y',
  '3yr': '3Y',
  '5yr': '5Y',
  '10yr': '10Y',
};

// Gas trend keys differ from FRED monthly keys (gas is weekly with its own period labels)
function gasKey(p: Period): string {
  const map: Record<Period, string> = {
    '6mo': '6mo',
    '1yr': '12mo',
    '2yr': '24mo',
    '3yr': '36mo',
    '5yr': '5yr',
    '10yr': '10yr',
  };
  return map[p];
}

function buildHistoricalScores(
  cpi: IndicatorData,
  coreCpi: IndicatorData,
  unemployment: IndicatorData,
  unemployment6: IndicatorData,
  gasPrice: IndicatorData,
  foodCpi: IndicatorData,
  shelterCpi: IndicatorData,
  wageGrowth: IndicatorData
): Partial<Record<Period, ChartPoint[]>> {
  const result: Partial<Record<Period, ChartPoint[]>> = {};

  function nearest(pts: ChartPoint[], dateStr: string): number | null {
    if (!pts.length) return null;
    const t = new Date(dateStr).getTime();
    return pts.reduce((best, p) =>
      Math.abs(new Date(p.date).getTime() - t) < Math.abs(new Date(best.date).getTime() - t)
        ? p
        : best
    ).value;
  }

  const getPts = (d: IndicatorData, key: string) =>
    d.trends.find((t) => t.period === key)?.chartPoints ?? [];

  for (const period of ['6mo', '1yr', '2yr', '3yr', '5yr', '10yr'] as Period[]) {
    const corePts = getPts(coreCpi, period);
    if (corePts.length < 3) continue;

    const cpiPts = getPts(cpi, period);
    const u3Pts = getPts(unemployment, period);
    const u6Pts = getPts(unemployment6, period);
    const gasPts = getPts(gasPrice, gasKey(period));
    const foodPts = getPts(foodCpi, period);
    const shelterPts = getPts(shelterCpi, period);
    const wagePts = getPts(wageGrowth, period);

    // Skip if key series missing (gas history may not extend this far)
    if (!gasPts.length || !u6Pts.length) continue;

    const pts = corePts
      .map((sp) => {
        const coreCpiVal = sp.value;
        const cpiVal = nearest(cpiPts, sp.date) ?? coreCpiVal;
        const u3Val = nearest(u3Pts, sp.date);
        const u6Val = nearest(u6Pts, sp.date);
        const gasVal = nearest(gasPts, sp.date);
        const foodVal = nearest(foodPts, sp.date);
        const shelterVal = nearest(shelterPts, sp.date);
        const wageVal = nearest(wagePts, sp.date);

        if (
          u3Val === null ||
          u6Val === null ||
          gasVal === null ||
          foodVal === null ||
          shelterVal === null ||
          wageVal === null
        )
          return null;

        const s = composite(coreCpiVal, u3Val, u6Val, gasVal, foodVal, shelterVal, wageVal, cpiVal);
        return { date: sp.date, value: Math.round(s * 10) / 10 };
      })
      .filter(Boolean) as ChartPoint[];

    if (pts.length >= 3) result[period] = pts;
  }

  return result;
}

// ── Score History Chart ────────────────────────────────────────────

const MONTH_NAMES = [
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

function fmtChartDate(d: string, totalMonths: number): string {
  const dt = new Date(d);
  if (totalMonths > 36) return `${dt.getFullYear()}`;
  return `${MONTH_NAMES[dt.getMonth()]} '${String(dt.getFullYear()).slice(2)}`;
}

function ScoreHistoryChart({ points }: { points: ChartPoint[] }) {
  const [containerW, setContainerW] = useState(0);

  if (!points || points.length < 3) return null;

  const chartH = 110;
  const leftPad = 26;
  const rightPad = 8;
  const topPad = 6;
  const bottomPad = 16;
  const chartWidth = containerW - leftPad - rightPad;
  const chartInnerH = chartH - topPad - bottomPad;

  const toY = (v: number) => topPad + chartInnerH - (v / 100) * chartInnerH;
  const toX = (i: number) => leftPad + (i / (points.length - 1)) * chartWidth;

  const latest = points[points.length - 1].value;
  const lineColor = getColor(latest);

  const totalMonths = Math.round(
    (new Date(points[points.length - 1].date).getTime() - new Date(points[0].date).getTime()) /
      (30.44 * 24 * 60 * 60 * 1000)
  );

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)} ${toY(p.value).toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${toX(points.length - 1).toFixed(1)} ${toY(0).toFixed(1)} L ${toX(0).toFixed(1)} ${toY(0).toFixed(1)} Z`;

  const xLabelIdxs = [0, Math.floor(points.length / 2), points.length - 1];

  const zones = [
    { from: 75, to: 100, color: '#16a34a' },
    { from: 55, to: 75, color: '#ca8a04' },
    { from: 35, to: 55, color: '#ea580c' },
    { from: 0, to: 35, color: '#dc2626' },
  ];

  const yTicks = [35, 55, 75];
  const gradId = `sg_${points.length}_${Math.round(latest * 10)}`;

  return (
    <View
      style={{ width: '100%', height: chartH + bottomPad }}
      onLayout={(e: LayoutChangeEvent) => setContainerW(e.nativeEvent.layout.width)}
    >
      {containerW >= 50 && (
        <>
          {xLabelIdxs.map((idx) => (
            <Text
              key={`xl-${idx}`}
              style={{
                position: 'absolute',
                top: chartH,
                left: toX(idx) - 20,
                width: 40,
                textAlign: 'center',
                fontSize: 8,
                color: '#9ca3af',
              }}
            >
              {fmtChartDate(points[idx].date, totalMonths)}
            </Text>
          ))}
          <Svg width={containerW} height={chartH} viewBox={`0 0 ${containerW} ${chartH}`}>
            <Defs>
              <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={lineColor} stopOpacity={0.3} />
                <Stop offset="1" stopColor={lineColor} stopOpacity={0.02} />
              </LinearGradient>
            </Defs>

            {/* Zone bands */}
            {zones.map((z, i) => (
              <Rect
                key={`z-${i}`}
                x={leftPad}
                y={toY(z.to)}
                width={chartWidth > 0 ? chartWidth : 0}
                height={toY(z.from) - toY(z.to)}
                fill={z.color}
                fillOpacity={0.06}
              />
            ))}

            {/* Zone boundary grid lines + Y labels */}
            {yTicks.map((v) => (
              <React.Fragment key={`gt-${v}`}>
                <Line
                  x1={leftPad}
                  y1={toY(v)}
                  x2={leftPad + chartWidth}
                  y2={toY(v)}
                  stroke="#e5e7eb"
                  strokeWidth={0.5}
                  strokeDasharray="3,3"
                />
                <SvgText
                  x={leftPad - 3}
                  y={toY(v) + 3}
                  textAnchor="end"
                  fontSize={7}
                  fill="#9ca3af"
                >
                  {v}
                </SvgText>
              </React.Fragment>
            ))}

            {/* Area fill */}
            <Path d={areaPath} fill={`url(#${gradId})`} />

            {/* Line */}
            <Path
              d={linePath}
              fill="none"
              stroke={lineColor}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Latest dot */}
            <Circle
              cx={toX(points.length - 1).toFixed(1)}
              cy={toY(points[points.length - 1].value).toFixed(1)}
              r={3.5}
              fill={lineColor}
              stroke="#ffffff"
              strokeWidth={1.5}
            />
          </Svg>
        </>
      )}
    </View>
  );
}

// ── Gauge SVG ─────────────────────────────────────────────────────

function GaugeSVG({ score, color }: { score: number; color: string }) {
  const cx = 120,
    cy = 115,
    r = 80;
  const startX = cx - r;
  const startY = cy;
  const endX = cx + r;
  const endY = cy;

  const fillAngleRad = ((180 - (score / 100) * 180) * Math.PI) / 180;
  const fillX = cx + r * Math.cos(fillAngleRad);
  const fillY = cy - r * Math.sin(fillAngleRad);

  const bgPath = `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`;
  const fillPath =
    score <= 0
      ? null
      : score >= 100
        ? `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`
        : `M ${startX} ${startY} A ${r} ${r} 0 0 1 ${fillX.toFixed(1)} ${fillY.toFixed(1)}`;

  const showDot = score > 2 && score < 98;

  return (
    <Svg width={240} height={130} viewBox="0 0 240 130">
      <Path d={bgPath} stroke="#e5e7eb" strokeWidth={18} fill="none" strokeLinecap="round" />
      {fillPath && (
        <Path d={fillPath} stroke={color} strokeWidth={18} fill="none" strokeLinecap="round" />
      )}
      {showDot && <Circle cx={fillX.toFixed(1)} cy={fillY.toFixed(1)} r={9} fill={color} />}
      <SvgText x={cx} y={100} textAnchor="middle" fontSize={30} fontWeight="bold" fill={color}>
        {Math.round(score)}
      </SvgText>
      <SvgText x={cx} y={114} textAnchor="middle" fontSize={9} fill="#9ca3af">
        /100
      </SvgText>
      <SvgText x={36} y={128} textAnchor="middle" fontSize={8} fill="#d1d5db">
        0
      </SvgText>
      <SvgText x={120} y={38} textAnchor="middle" fontSize={8} fill="#d1d5db">
        50
      </SvgText>
      <SvgText x={204} y={128} textAnchor="middle" fontSize={8} fill="#d1d5db">
        100
      </SvgText>
    </Svg>
  );
}

// ── Main component ────────────────────────────────────────────────

export function MiddleClassHealthScore({
  cpi,
  coreCpi,
  unemployment,
  unemployment6,
  gasPrice,
  foodCpi,
  shelterCpi,
  wageGrowth,
  isLoading,
  delay = 0,
}: Props) {
  const [showMethodology, setShowMethodology] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<Period>('1yr');

  const result = useMemo(() => {
    if (!cpi || !coreCpi || !unemployment || !gasPrice || !foodCpi || !shelterCpi || !wageGrowth)
      return null;

    // Fall back to U-3 for both positions if U-6 is not yet loaded
    const u6 = unemployment6 ?? unemployment;

    const components: ScoreComponent[] = [
      {
        label: 'Core Inflation',
        score: scoreCPI(coreCpi.current),
        value: `${coreCpi.current.toFixed(1)}% YoY`,
      },
      {
        label: 'Employment (U-3)',
        score: scoreUnemployment(unemployment.current),
        value: `${unemployment.current.toFixed(1)}% U-3`,
      },
      {
        label: 'Employment (U-6)',
        score: scoreUnemploymentU6(u6.current),
        value: `${u6.current.toFixed(1)}% U-6`,
      },
      {
        label: 'Gas Prices',
        score: scoreGasPrice(gasPrice.current),
        value: `$${gasPrice.current.toFixed(2)}/gal`,
      },
      {
        label: 'Food Costs',
        score: scoreFoodCPI(foodCpi.current),
        value: `${foodCpi.current.toFixed(1)}% YoY`,
      },
      {
        label: 'Housing',
        score: scoreShelterCPI(shelterCpi.current),
        value: `${shelterCpi.current.toFixed(1)}% YoY`,
      },
      {
        label: 'Real Wages',
        score: scoreRealWage(wageGrowth.current, cpi.current),
        value: `${(wageGrowth.current - cpi.current).toFixed(1)}% real growth`,
      },
    ];

    const totalScore = composite(
      coreCpi.current,
      unemployment.current,
      u6.current,
      gasPrice.current,
      foodCpi.current,
      shelterCpi.current,
      wageGrowth.current,
      cpi.current
    );

    const prev6mo = (d: IndicatorData) =>
      d.trends.find((t) => t.period === '6mo')?.previous ?? d.current;

    const prevScore = composite(
      prev6mo(coreCpi),
      prev6mo(unemployment),
      prev6mo(u6),
      prev6mo(gasPrice),
      prev6mo(foodCpi),
      prev6mo(shelterCpi),
      prev6mo(wageGrowth),
      prev6mo(cpi)
    );

    const trendDelta = totalScore - prevScore;
    const summary = buildSummary(totalScore, components, trendDelta);

    return { score: totalScore, components, trendDelta, summary };
  }, [cpi, coreCpi, unemployment, unemployment6, gasPrice, foodCpi, shelterCpi, wageGrowth]);

  // Historical composite score — computed from chartPoints already fetched per indicator
  const historicalScores = useMemo(() => {
    if (
      !cpi ||
      !coreCpi ||
      !unemployment ||
      !unemployment6 ||
      !gasPrice ||
      !foodCpi ||
      !shelterCpi ||
      !wageGrowth
    )
      return {};
    return buildHistoricalScores(
      cpi,
      coreCpi,
      unemployment,
      unemployment6,
      gasPrice,
      foodCpi,
      shelterCpi,
      wageGrowth
    );
  }, [cpi, coreCpi, unemployment, unemployment6, gasPrice, foodCpi, shelterCpi, wageGrowth]);

  const availablePeriods = Object.keys(historicalScores) as Period[];

  const cardStyle = {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderRadius: 16,
    backgroundColor: 'white',
  };

  if (isLoading || !result) {
    return (
      <Animated.View
        entering={FadeInDown.delay(delay).duration(500)}
        className="bg-white rounded-2xl border border-gray-100 mb-4"
        style={cardStyle}
      >
        <View className="items-center py-10">
          <ActivityIndicator color="#3b82f6" />
          <Text className="text-xs text-gray-400 mt-2">Calculating economic health index...</Text>
        </View>
      </Animated.View>
    );
  }

  const { score, components, trendDelta, summary } = result;
  const color = getColor(score);
  const statusLabel = getStatusLabel(score);
  const trend = getTrendInfo(trendDelta);
  const chartPoints = historicalScores[chartPeriod];

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600)}
      style={cardStyle}
      className="mb-4"
    >
      <View className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <View
          className="px-4 pt-4 pb-3"
          style={{ borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}
        >
          <View className="flex-row items-center">
            <Text className="text-sm font-bold text-gray-900 flex-1">
              Working Class Economic Health
            </Text>
            <View className="rounded-full px-2.5 py-0.5" style={{ backgroundColor: `${color}18` }}>
              <Text className="text-[10px] font-bold" style={{ color }}>
                {statusLabel}
              </Text>
            </View>
          </View>
          <Text className="text-[10px] text-gray-400 mt-0.5">
            Composite index — 7 government data sources (BLS, EIA, Fed) • Fact-based, no political
            bias
          </Text>
        </View>

        {/* Gauge */}
        <View className="items-center pt-1">
          <GaugeSVG score={score} color={color} />
          <View
            className="flex-row items-center rounded-full px-3 py-1 mb-3"
            style={{ backgroundColor: `${trend.color}15` }}
          >
            <Text style={{ color: trend.color, fontSize: 13, marginRight: 3 }}>{trend.arrow}</Text>
            <Text className="text-xs font-semibold" style={{ color: trend.color }}>
              {trend.text}
            </Text>
            <Text className="text-[9px] text-gray-400 ml-1">vs 6 months ago</Text>
          </View>
        </View>

        {/* Neutral summary */}
        <View className="mx-4 mb-3 px-3 py-2 rounded-xl bg-gray-50">
          <Text className="text-xs text-gray-600 leading-4">{summary}</Text>
        </View>

        {/* Component breakdown */}
        <View className="px-4 pb-3">
          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
            Score Breakdown
          </Text>
          {components.map((c, i) => (
            <View key={c.label} className="mb-2">
              <View className="flex-row justify-between items-center mb-0.5">
                <View className="flex-row items-center" style={{ gap: 4 }}>
                  <Text className="text-xs font-semibold text-gray-700">{c.label}</Text>
                  <Text className="text-[9px] text-gray-400">
                    ({Math.round(WEIGHTS[i] * 100)}% weight)
                  </Text>
                </View>
                <View className="flex-row items-center" style={{ gap: 4 }}>
                  <Text className="text-[10px] text-gray-400">{c.value}</Text>
                  <Text className="text-xs font-bold" style={{ color: getColor(c.score) }}>
                    {Math.round(c.score)}
                  </Text>
                </View>
              </View>
              <View
                className="rounded-full overflow-hidden"
                style={{ height: 6, backgroundColor: '#f3f4f6' }}
              >
                <View
                  className="h-full rounded-full"
                  style={{ width: `${c.score}%`, backgroundColor: getColor(c.score) }}
                />
              </View>
            </View>
          ))}
          <Text className="text-xs text-gray-500 mt-1">
            Score 0–100: 75+ Strong • 55–74 Moderate • 35–54 Strained • 0–34 Struggling
          </Text>
        </View>

        {/* Score History Chart */}
        {availablePeriods.length > 0 && (
          <View
            className="px-4 pb-4"
            style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12 }}
          >
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Score History
              </Text>
              <View className="flex-row" style={{ gap: 4 }}>
                {(['6mo', '1yr', '2yr', '3yr', '5yr', '10yr'] as Period[])
                  .filter((p) => availablePeriods.includes(p))
                  .map((p) => (
                    <Pressable
                      key={p}
                      onPress={() => setChartPeriod(p)}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: 99,
                        backgroundColor: chartPeriod === p ? color : '#f3f4f6',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: '700',
                          color: chartPeriod === p ? 'white' : '#6b7280',
                        }}
                      >
                        {PERIOD_LABELS[p]}
                      </Text>
                    </Pressable>
                  ))}
              </View>
            </View>
            {chartPoints ? (
              <ScoreHistoryChart points={chartPoints} />
            ) : (
              <Text className="text-[10px] text-gray-400 text-center py-4">
                Not enough historical data for this period
              </Text>
            )}
          </View>
        )}

        {/* How is this calculated? */}
        <View style={{ borderTopWidth: 1, borderTopColor: '#f3f4f6' }} className="px-4 pb-4 pt-3">
          <Pressable
            onPress={() => setShowMethodology(!showMethodology)}
            className="flex-row items-center"
          >
            <Text className="text-sm font-semibold text-blue-500 flex-1">
              {showMethodology ? '▲' : '▼'} How is this score calculated?
            </Text>
          </Pressable>

          {showMethodology && (
            <View className="mt-2">
              <Text className="text-xs text-gray-600 leading-5 mb-3">
                Each of 7 indicators is scored independently on a 0–100 scale (100 = best for
                working class), then combined using a weighted average. Indicators are chosen to be
                non-overlapping — Core CPI (ex-food &amp; ex-energy) is used for the inflation
                component so that gas prices and food costs aren't double-counted.{'\n\n'}
                <Text className="font-semibold">Why is too much inflation bad?</Text> High inflation
                erodes purchasing power — your paycheck buys less each month, hitting essentials
                like groceries, rent, and gas hardest.{'\n\n'}
                <Text className="font-semibold">Why is disinflation/deflation bad?</Text> The Fed
                targets 2% inflation. When inflation drops too far below 2% (disinflation) or goes
                negative (deflation), it signals weak demand, risks wage cuts, and can spiral into
                economic stagnation — as seen in Japan's "lost decades."{'\n\n'}
                <Text className="font-semibold">Why U-6 over U-3?</Text> The official U-3 rate only
                counts people actively job-hunting. U-6 also includes discouraged workers who
                stopped looking and people stuck in part-time jobs who want full-time. U-6 paints a
                more honest picture of labor market stress — especially for working class households
                — so it carries more weight in this index.
              </Text>

              {[
                {
                  label: 'Core Inflation (CPI ex-food, ex-energy)',
                  weight: '20%',
                  source: 'BLS via FRED',
                  formula:
                    "Peaks at Fed's 2% target: ≥2% → 100−(rate−2)/8×100; 0–2% → 75+rate/2×25; <0% → 75+rate/4×75   →   2%=100, 0%=75, −4%=0, 5%=62, 10%=0",
                  why: "The Fed's 2% target is optimal. Too much inflation erodes purchasing power. Too little (disinflation) or deflation signals weak demand and economic stagnation.",
                },
                {
                  label: 'Employment — U-3 (Official Unemployment)',
                  weight: '8%',
                  source: 'BLS via FRED',
                  formula:
                    'Score = (15 − rate) ÷ 12 × 100   →   3% = 100, 6% = 75, 10% = 42, 15%+ = 0',
                  why: 'The official headline rate. Included but given less weight than U-6 because it understates true labor market stress by excluding discouraged and underemployed workers.',
                },
                {
                  label: 'Employment — U-6 (Broad Unemployment)',
                  weight: '12%',
                  source: 'BLS via FRED',
                  formula:
                    'Score = (28 − rate) ÷ 21 × 100   →   7% = 100, 14% = 67, 21% = 33, 28%+ = 0',
                  why: 'Includes officially unemployed + discouraged workers + involuntary part-time workers. Better reflects true labor market health for working class households. Outweighs U-3.',
                },
                {
                  label: 'Gas Prices (regular unleaded $/gal)',
                  weight: '15%',
                  source: 'EIA via FRED',
                  formula:
                    'Score = (5 − price) ÷ 3 × 100   →   $2 = 100, $3 = 67, $4 = 33, $5+ = 0',
                  why: 'Direct, visible cost felt at every fill-up — disproportionately impacts lower incomes.',
                },
                {
                  label: 'Food Costs (Food CPI YoY%)',
                  weight: '15%',
                  source: 'BLS via FRED',
                  formula:
                    '0% = optimal. Inflation: 100−rate/10×100. Deflation: 100+rate/6×100.   →   0%=100, −2%=67, −6%=0, 3%=70, 10%=0',
                  why: 'Flat food prices are best. Some disinflation offers short-term relief, but severe food price deflation signals economic distress. Food inflation hits working families hardest.',
                },
                {
                  label: 'Housing (Shelter CPI YoY%)',
                  weight: '15%',
                  source: 'BLS via FRED',
                  formula:
                    '0% = optimal. Inflation: 100−rate/10×100. Deflation: 100+rate/6×100.   →   0%=100, −2%=67, −6%=0, 3%=70, 10%=0',
                  why: 'Flat rent is best for renters. Some shelter deflation is OK short-term, but severe housing price deflation signals market crisis. Rent is the largest single budget item for most households.',
                },
                {
                  label: 'Real Wages (nominal wage growth − headline CPI)',
                  weight: '15%',
                  source: 'BLS / Fed',
                  formula:
                    'Real = wage growth % − headline CPI %.   Score = (real + 5) ÷ 8 × 100   →   +3% = 100, 0% = 62, −5%+ = 0',
                  why: 'Whether paychecks are keeping up with actual cost of living. Headline CPI used here to reflect true purchasing power.',
                },
              ].map((m) => (
                <View key={m.label} className="mb-3 bg-gray-50 rounded-xl px-3 py-2">
                  <View className="flex-row justify-between items-center mb-0.5">
                    <Text className="text-xs font-bold text-gray-800 flex-1 mr-2">{m.label}</Text>
                    <View className="rounded-full px-2 py-0.5 bg-gray-200">
                      <Text className="text-[9px] font-semibold text-gray-600">{m.weight}</Text>
                    </View>
                  </View>
                  <Text className="text-[10px] text-gray-400 mb-1">Source: {m.source}</Text>
                  <Text className="text-[10px] font-mono text-indigo-600 mb-1 leading-4">
                    {m.formula}
                  </Text>
                  <Text className="text-[10px] text-gray-500 leading-4 italic">{m.why}</Text>
                </View>
              ))}

              <View className="bg-blue-50 rounded-xl px-3 py-2">
                <Text className="text-[9px] font-bold text-blue-700 mb-1">Final Score Formula</Text>
                <Text className="text-[9px] font-mono text-blue-600 leading-4">
                  Score = (Core Inflation × 20%){'\n'}
                  {'      '}+ (U-3 Employment × 8%){'\n'}
                  {'      '}+ (U-6 Employment × 12%){'\n'}
                  {'      '}+ (Gas Prices × 15%){'\n'}
                  {'      '}+ (Food Costs × 15%){'\n'}
                  {'      '}+ (Housing × 15%){'\n'}
                  {'      '}+ (Real Wages × 15%)
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}
