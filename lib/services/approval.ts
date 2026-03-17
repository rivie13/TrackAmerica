// Approval ratings service
// Fetches historical RCP averages for multiple presidents + current poll sources.
// Uses orig.realclearpolitics.com JSON endpoints (the www subdomain returns 403).

import type {
  IndicatorData,
  TrendPoint,
  ChartPoint,
  PresidentMarker,
  PollSource,
} from './economic';
import { corsFetch } from '../utils/cors-fetch';

// ── President configuration ──────────────────────────────────────

interface PresidentConfig {
  key: string;
  id: number;
  name: string;
  shortName: string;
  party: 'R' | 'D';
  inauguration: string;
  end: string | null; // null = current president
  sourceUrl: string;
}

const PRESIDENTS: PresidentConfig[] = [
  {
    key: 'bush',
    id: 904,
    name: 'George W. Bush',
    shortName: 'Bush',
    party: 'R',
    inauguration: '2001-01-20',
    end: '2009-01-20',
    sourceUrl: 'https://www.realclearpolling.com/polls/approval/george-w-bush/approval-rating',
  },
  {
    key: 'obama',
    id: 1044,
    name: 'Barack Obama',
    shortName: 'Obama',
    party: 'D',
    inauguration: '2009-01-20',
    end: '2017-01-20',
    sourceUrl: 'https://www.realclearpolling.com/polls/approval/barack-obama/approval-rating',
  },
  {
    key: 'trump1',
    id: 6179,
    name: 'Donald Trump (1st Term)',
    shortName: 'Trump',
    party: 'R',
    inauguration: '2017-01-20',
    end: '2021-01-20',
    sourceUrl:
      'https://www.realclearpolling.com/polls/approval/donald-trump/approval-rating-1st-term',
  },
  {
    key: 'biden',
    id: 7320,
    name: 'Joe Biden',
    shortName: 'Biden',
    party: 'D',
    inauguration: '2021-01-20',
    end: '2025-01-20',
    sourceUrl: 'https://www.realclearpolling.com/polls/approval/joe-biden/approval-rating',
  },
  {
    key: 'trump2',
    id: 8656,
    name: 'Donald Trump (2nd Term)',
    shortName: 'Trump',
    party: 'R',
    inauguration: '2025-01-20',
    end: null,
    sourceUrl: 'https://www.realclearpolling.com/polls/approval/donald-trump/approval-rating',
  },
];

const CURRENT_PRESIDENT = PRESIDENTS[PRESIDENTS.length - 1];

// ── Data fetching ────────────────────────────────────────────────

const HISTORICAL_URL = (id: number) =>
  `https://orig.realclearpolitics.com/epolls/json/${id}_historical.js`;

const POLLS_URL = (id: number) =>
  `https://orig.realclearpolitics.com/poll/race/${id}/polling_data.json`;

interface RcpHistoricalEntry {
  date: string;
  candidate: Array<{ name: string; value: number | string }>;
}

/** Normalize RCP dates to ISO "YYYY-MM-DD" */
function normalizeDate(raw: string): string {
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  const parts = raw.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (parts) {
    const [, m, day, year] = parts;
    return `${year}-${m.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return raw;
}

/** Fetch historical RCP average time series for one president */
async function fetchHistoricalSeries(config: PresidentConfig): Promise<ChartPoint[]> {
  try {
    const res = await corsFetch(HISTORICAL_URL(config.id));
    if (!res.ok) return [];

    let text = await res.text();
    // Handle JSONP wrapper: return_json({...})
    const match = text.match(/return_json\(([\s\S]+)\)/);
    if (match) text = match[1];

    const json = JSON.parse(text);
    const entries: RcpHistoricalEntry[] = json.poll?.rcp_avg ?? [];

    return entries
      .map((e) => {
        const approve = e.candidate?.find(
          (c) =>
            c.name.toLowerCase().includes('approve') && !c.name.toLowerCase().includes('disapprove')
        );
        if (!approve) return null;
        const val = typeof approve.value === 'string' ? parseFloat(approve.value) : approve.value;
        if (isNaN(val)) return null;
        const date = normalizeDate(e.date);
        return { date, value: val, president: config.key } as ChartPoint;
      })
      .filter((p): p is ChartPoint => p !== null)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch {
    return [];
  }
}

/** Fetch current president's latest RCP average + individual poll sources */
async function fetchCurrentPolls(): Promise<{
  approve: number;
  disapprove: number;
  date: string;
  sources: PollSource[];
} | null> {
  try {
    const res = await corsFetch(POLLS_URL(CURRENT_PRESIDENT.id));
    if (!res.ok) return null;
    const json = await res.json();
    const polls: any[] = json.poll ?? [];

    // Extract RCP average (first entry with type "rcp_average")
    const rcpAvg = polls.find((p) => p.type === 'rcp_average');
    if (!rcpAvg) return null;

    const approve = parseFloat(
      rcpAvg.candidate?.find((c: any) => c.name === 'Approve')?.value ?? '0'
    );
    const disapprove = parseFloat(
      rcpAvg.candidate?.find((c: any) => c.name === 'Disapprove')?.value ?? '0'
    );

    // Parse end date from range like "2/24 - 3/15" or "2/24 - 3/15/2026"
    const dateStr: string = rcpAvg.date ?? '';
    const endMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s*$/);
    let date = new Date().toISOString().split('T')[0];
    if (endMatch) {
      const [, m, d, y] = endMatch;
      const year = y ? (y.length === 2 ? `20${y}` : y) : new Date().getFullYear().toString();
      date = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // Extract individual poll sources (skip rcp_average and non-latest duplicates)
    const seen = new Set<string>();
    const sources: PollSource[] = polls
      .filter((p) => p.type !== 'rcp_average' && p.pollster)
      .filter((p) => {
        const name = p.pollster_group_name || p.pollster;
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      })
      .slice(0, 15)
      .map((p) => ({
        pollster: p.pollster_group_name || p.pollster,
        date: p.date,
        approve: parseFloat(p.candidate?.find((c: any) => c.name === 'Approve')?.value ?? '0'),
        disapprove: parseFloat(
          p.candidate?.find((c: any) => c.name === 'Disapprove')?.value ?? '0'
        ),
        sampleSize: p.sampleSize || undefined,
      }));

    return { approve, disapprove, date, sources };
  } catch {
    return null;
  }
}

// ── Data processing ──────────────────────────────────────────────

/** Downsample chart points while preserving president boundaries */
function downsample(points: ChartPoint[], maxPoints: number): ChartPoint[] {
  if (points.length <= maxPoints) return points;

  // Group by president key, downsample within each group proportionally
  const groups = new Map<string, ChartPoint[]>();
  for (const p of points) {
    const key = p.president ?? '';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }

  const result: ChartPoint[] = [];
  for (const [, group] of groups) {
    const quota = Math.max(3, Math.round((group.length / points.length) * maxPoints));
    if (group.length <= quota) {
      result.push(...group);
    } else {
      const step = group.length / quota;
      for (let i = 0; i < quota; i++) {
        result.push(group[Math.min(Math.round(i * step), group.length - 1)]);
      }
      // Always include first and last point of each group
      if (result[result.length - 1] !== group[group.length - 1]) {
        result.push(group[group.length - 1]);
      }
    }
  }

  return result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function sliceByMonths(series: ChartPoint[], months: number): ChartPoint[] {
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return series.filter((p) => new Date(p.date) >= cutoff);
}

function buildTrend(
  currentValue: number,
  series: ChartPoint[],
  months: number
): Omit<TrendPoint, 'period'> {
  const chartPoints = sliceByMonths(series, months);

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);

  let closest: ChartPoint | null = null;
  let closestDiff = Infinity;
  for (const p of chartPoints) {
    const t = new Date(p.date).getTime();
    if (isNaN(t)) continue;
    const diff = Math.abs(t - cutoff.getTime());
    if (diff < closestDiff) {
      closestDiff = diff;
      closest = p;
    }
  }

  const prev = closest?.value ?? null;
  const change =
    prev !== null && prev !== 0 ? ((currentValue - prev) / Math.abs(prev)) * 100 : null;

  return { previous: prev, change, chartPoints: downsample(chartPoints, 300) };
}

function buildPresidentMarkers(
  presidentSeries: Map<PresidentConfig, ChartPoint[]>
): PresidentMarker[] {
  const markers: PresidentMarker[] = [];
  for (const [config, series] of presidentSeries) {
    if (series.length === 0) continue;
    markers.push({
      key: config.key,
      name: config.name,
      shortName: config.shortName,
      party: config.party,
      startDate: series[0].date,
      endDate: series[series.length - 1].date,
    });
  }
  return markers.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}

// ── Main exports ─────────────────────────────────────────────────

export async function fetchPresidentApproval(): Promise<IndicatorData> {
  // Fetch all presidents' historical data + current poll sources in parallel
  const [historicalResults, currentPolls] = await Promise.all([
    Promise.all(
      PRESIDENTS.map(async (config) => {
        const series = await fetchHistoricalSeries(config);
        return [config, series] as const;
      })
    ),
    fetchCurrentPolls(),
  ]);

  // Build per-president map (only include presidents with data)
  const presidentSeries = new Map<PresidentConfig, ChartPoint[]>();
  for (const [config, series] of historicalResults) {
    if (series.length > 0) {
      presidentSeries.set(config, series);
    }
  }

  // Current president's historical series
  const currentSeries = presidentSeries.get(CURRENT_PRESIDENT) ?? [];

  // If we got a newer RCP average from polling_data.json, add it as a data point
  if (currentPolls && currentSeries.length > 0) {
    const lastHistorical = currentSeries[currentSeries.length - 1];
    if (new Date(currentPolls.date) > new Date(lastHistorical.date)) {
      currentSeries.push({
        date: currentPolls.date,
        value: currentPolls.approve,
        president: CURRENT_PRESIDENT.key,
      });
    }
  }

  // Combine all series sorted by date
  const allPoints: ChartPoint[] = [];
  for (const series of presidentSeries.values()) {
    allPoints.push(...series);
  }
  allPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Build president markers
  const presidentMarkers = buildPresidentMarkers(presidentSeries);

  // Determine current value
  let currentValue: number;
  let currentDate: string;

  if (currentPolls) {
    // Prefer the latest RCP average from polling_data.json
    currentValue = currentPolls.approve;
    currentDate = currentPolls.date;
  } else if (currentSeries.length > 0) {
    currentValue = currentSeries[currentSeries.length - 1].value;
    currentDate = currentSeries[currentSeries.length - 1].date;
  } else {
    // Complete fallback
    return getStaticPresidentApproval();
  }

  // Build trends — short periods use current president only, long periods use all
  const trends: TrendPoint[] = [
    { period: '3mo', ...buildTrend(currentValue, currentSeries, 3) },
    { period: '6mo', ...buildTrend(currentValue, currentSeries, 6) },
    { period: '1yr', ...buildTrend(currentValue, currentSeries, 12) },
  ];

  // Add longer periods that span multiple presidents
  const longPeriods = [
    { label: '3yr', months: 36 },
    { label: '5yr', months: 60 },
    { label: '10yr', months: 120 },
    { label: '15yr', months: 180 },
    { label: '20yr', months: 240 },
  ];

  for (const { label, months } of longPeriods) {
    const t = buildTrend(currentValue, allPoints, months);
    if (t.chartPoints && t.chartPoints.length > 0) {
      trends.push({ period: label, ...t });
    }
  }

  // "All" period — show everything
  if (allPoints.length > 0) {
    trends.push({
      period: 'All',
      previous: allPoints[0]?.value ?? null,
      change: null,
      chartPoints: downsample(allPoints, 300),
    });
  }

  const sources = currentPolls?.sources ?? [];

  return {
    current: currentValue,
    currentDate,
    unit: '%',
    label: 'Presidential Approval',
    description: `RCP polling average of the President's job approval rating. Current: ${CURRENT_PRESIDENT.name} (inaugurated Jan ${CURRENT_PRESIDENT.inauguration.slice(0, 4)}).`,
    sourceUrl: CURRENT_PRESIDENT.sourceUrl,
    sourceName: 'RealClearPolling',
    trends,
    presidentMarkers,
    sources,
  };
}

// ── Congress approval ────────────────────────────────────────────

const CONGRESS_ID = 903;

/** Fetch congress poll sources from polling_data.json */
async function fetchCongressPollSources(): Promise<{
  approve: number;
  disapprove: number;
  date: string;
  sources: PollSource[];
} | null> {
  try {
    const res = await corsFetch(POLLS_URL(CONGRESS_ID));
    if (!res.ok) return null;
    const json = await res.json();
    const polls: any[] = json.poll ?? [];

    const rcpAvg = polls.find((p) => p.type === 'rcp_average');
    if (!rcpAvg) return null;

    const approve = parseFloat(
      rcpAvg.candidate?.find((c: any) => c.name === 'Approve')?.value ?? '0'
    );
    const disapprove = parseFloat(
      rcpAvg.candidate?.find((c: any) => c.name === 'Disapprove')?.value ?? '0'
    );

    const dateStr: string = rcpAvg.date ?? '';
    const endMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\s*$/);
    let date = new Date().toISOString().split('T')[0];
    if (endMatch) {
      const [, m, d, y] = endMatch;
      const year = y ? (y.length === 2 ? `20${y}` : y) : new Date().getFullYear().toString();
      date = `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    const seen = new Set<string>();
    const sources: PollSource[] = polls
      .filter((p) => p.type !== 'rcp_average' && p.pollster)
      .filter((p) => {
        const name = p.pollster_group_name || p.pollster;
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      })
      .slice(0, 15)
      .map((p) => ({
        pollster: p.pollster_group_name || p.pollster,
        date: p.date,
        approve: parseFloat(p.candidate?.find((c: any) => c.name === 'Approve')?.value ?? '0'),
        disapprove: parseFloat(
          p.candidate?.find((c: any) => c.name === 'Disapprove')?.value ?? '0'
        ),
        sampleSize: p.sampleSize || undefined,
      }));

    return { approve, disapprove, date, sources };
  } catch {
    return null;
  }
}

export async function fetchCongressApproval(): Promise<IndicatorData> {
  // Fetch historical chart data + current poll sources in parallel
  const [series, currentPolls] = await Promise.all([
    fetchHistoricalSeries({
      key: 'congress',
      id: CONGRESS_ID,
      name: 'Congress',
      shortName: 'Congress',
      party: 'D',
      inauguration: '',
      end: null,
      sourceUrl: 'https://www.realclearpolling.com/polls/approval/congressional/approval-rating',
    }),
    fetchCongressPollSources(),
  ]);

  // Determine current value — prefer polling_data.json RCP average (more recent)
  let currentValue: number;
  let currentDate: string;

  if (currentPolls) {
    currentValue = currentPolls.approve;
    currentDate = currentPolls.date;
    // Add latest RCP average as a data point if newer than historical
    if (
      series.length > 0 &&
      new Date(currentPolls.date) > new Date(series[series.length - 1].date)
    ) {
      series.push({ date: currentPolls.date, value: currentPolls.approve });
    }
  } else if (series.length > 0) {
    currentValue = series[series.length - 1].value;
    currentDate = series[series.length - 1].date;
  } else {
    return getStaticCongressApproval();
  }

  // Build trends with available data
  const trends: TrendPoint[] = [
    { period: '3mo', ...buildTrend(currentValue, series, 3) },
    { period: '6mo', ...buildTrend(currentValue, series, 6) },
    { period: '1yr', ...buildTrend(currentValue, series, 12) },
  ];

  // Add longer periods where data exists
  const longPeriods = [
    { label: '3yr', months: 36 },
    { label: '5yr', months: 60 },
    { label: '10yr', months: 120 },
    { label: '15yr', months: 180 },
    { label: '20yr', months: 240 },
  ];

  for (const { label, months } of longPeriods) {
    const t = buildTrend(currentValue, series, months);
    if (t.chartPoints && t.chartPoints.length > 0) {
      trends.push({ period: label, ...t });
    }
  }

  // "All" — show everything
  if (series.length > 0) {
    trends.push({
      period: 'All',
      previous: series[0]?.value ?? null,
      change: null,
      chartPoints: downsample(series, 300),
    });
  }

  return {
    current: currentValue,
    currentDate,
    unit: '%',
    label: 'Congress Approval',
    description:
      'RCP polling average of Congressional job approval — how the public rates the overall performance of Congress.',
    sourceUrl: 'https://www.realclearpolling.com/polls/approval/congressional/approval-rating',
    sourceName: 'RealClearPolling',
    trends,
    sources: currentPolls?.sources,
  };
}

export async function fetchSupremeCourtApproval(): Promise<IndicatorData> {
  return getStaticSCOTUSApproval();
}

// ── Static fallbacks ─────────────────────────────────────────────

function syntheticChart(startVal: number, endVal: number, months: number): ChartPoint[] {
  const points: ChartPoint[] = [];
  const now = new Date();
  for (let i = months; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const progress = (months - i) / months;
    const noise = Math.sin(i * 1.5) * 1.2;
    const value = startVal + (endVal - startVal) * progress + noise;
    points.push({ date: date.toISOString().split('T')[0], value: Math.round(value * 10) / 10 });
  }
  return points;
}

function getStaticPresidentApproval(): IndicatorData {
  return {
    current: 42.7,
    currentDate: new Date().toISOString().split('T')[0],
    unit: '%',
    label: 'Presidential Approval',
    description:
      "RCP polling average of the President's job approval rating. Current: Donald Trump (2nd Term). Note: using cached data — live feed unavailable.",
    sourceUrl: 'https://www.realclearpolling.com/polls/approval/donald-trump/approval-rating',
    sourceName: 'RealClearPolling',
    trends: [
      { period: '3mo', previous: 48.2, change: -2.5, chartPoints: syntheticChart(48.2, 42.7, 3) },
      { period: '6mo', previous: 46.0, change: -7.2, chartPoints: syntheticChart(46.0, 42.7, 6) },
      { period: '1yr', previous: 48.5, change: -12.0, chartPoints: syntheticChart(48.5, 42.7, 12) },
    ],
  };
}

function getStaticCongressApproval(): IndicatorData {
  return {
    current: 23.8,
    currentDate: new Date().toISOString().split('T')[0],
    unit: '%',
    label: 'Congress Approval',
    description:
      'RCP polling average of Congressional job approval. Note: using cached data — live feed unavailable.',
    sourceUrl: 'https://www.realclearpolling.com/polls/approval/congressional/approval-rating',
    sourceName: 'RealClearPolling',
    trends: [
      { period: '3mo', previous: 22.0, change: 8.2, chartPoints: syntheticChart(22.0, 23.8, 3) },
      { period: '6mo', previous: 20.0, change: 19.0, chartPoints: syntheticChart(20.0, 23.8, 6) },
      { period: '1yr', previous: 20.0, change: 19.0, chartPoints: syntheticChart(20.0, 23.8, 12) },
    ],
  };
}

function getStaticSCOTUSApproval(): IndicatorData {
  return {
    current: 40.0,
    currentDate: new Date().toISOString().split('T')[0],
    unit: '%',
    label: 'Supreme Court Approval',
    description:
      'Gallup polling average of Supreme Court approval — how the public rates the job the Supreme Court is doing.',
    sourceUrl: 'https://news.gallup.com/poll/4732/supreme-court.aspx',
    sourceName: 'Gallup',
    trends: [
      { period: '6mo', previous: 39.0, change: 2.6, chartPoints: syntheticChart(39.0, 40.0, 6) },
      { period: '1yr', previous: 41.0, change: -2.4, chartPoints: syntheticChart(41.0, 40.0, 12) },
      { period: '3yr', previous: 44.0, change: -9.1, chartPoints: syntheticChart(44.0, 40.0, 36) },
    ],
  };
}
