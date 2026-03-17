// Economic data services — EIA (gas prices), FRED (dollar, rates), Treasury (debt)

import { corsFetch } from '../utils/cors-fetch';

const EIA_BASE = 'https://api.eia.gov/v2';
const FRED_BASE = 'https://api.stlouisfed.org/fred';

function getEiaKey(): string {
  const key = process.env.EXPO_PUBLIC_EIA_API_KEY;
  if (!key) {
    const message = 'Missing EIA API key. Set EXPO_PUBLIC_EIA_API_KEY in .env';
    console.warn(message);
    throw new Error(message);
  }
  return key;
}

function getFredKey(): string {
  const key = process.env.EXPO_PUBLIC_FRED_API_KEY;
  if (!key) {
    const message = 'Missing FRED API key. Set EXPO_PUBLIC_FRED_API_KEY in .env';
    console.warn(message);
    throw new Error(message);
  }
  return key;
}

// ── Gas Prices ────────────────────────────────────────────────────
// National: FRED series GASREGCOVW (weekly regular gas, ~35 years of history)
// Regional: EIA API (FRED only has national weekly data)
export async function fetchGasPrices(regionCode: GasRegionCode = 'NUS'): Promise<IndicatorData> {
  const regionLabel = GAS_REGIONS.find((r) => r.code === regionCode)?.label ?? 'National';

  if (regionCode === 'NUS') {
    return fetchNationalGasPricesFRED();
  }

  // Regional data — EIA, 3 years
  const eiaKey = getEiaKey();
  const url = `${EIA_BASE}/petroleum/pri/gnd/data/?api_key=${eiaKey}&frequency=weekly&data[0]=value&facets[product][]=EPM0&facets[duoarea][]=${regionCode}&sort[0][column]=period&sort[0][direction]=desc&length=156`;

  const res = await corsFetch(url);
  if (!res.ok) throw new Error(`EIA API error: ${res.status}`);
  const json = await res.json();

  const rawRows: Array<{ period: string; value: string | number }> = json.response?.data ?? [];
  if (rawRows.length === 0) throw new Error('No gas price data returned');

  const allPoints: ChartPoint[] = rawRows
    .map((r) => ({
      date: r.period,
      value: typeof r.value === 'string' ? parseFloat(r.value) : r.value,
    }))
    .filter((r) => !isNaN(r.value));

  if (allPoints.length === 0) throw new Error('No valid gas price data');

  const current = allPoints[0].value;
  const currentDate = allPoints[0].date;
  const sliceChart = (weeks: number) => allPoints.slice(0, weeks).reverse();

  return {
    current,
    currentDate,
    unit: '$/gal',
    label: `Gas Price — ${regionLabel}`,
    description: 'Weekly average for regular unleaded gasoline in this region.',
    sourceUrl: 'https://www.eia.gov/petroleum/gasdiesel/',
    sourceName: 'U.S. Energy Information Administration',
    trends: [
      {
        period: '3mo',
        previous: val(allPoints, 13),
        change: pctChange(current, allPoints, 13),
        chartPoints: sliceChart(13),
      },
      {
        period: '6mo',
        previous: val(allPoints, 26),
        change: pctChange(current, allPoints, 26),
        chartPoints: sliceChart(26),
      },
      {
        period: '9mo',
        previous: val(allPoints, 39),
        change: pctChange(current, allPoints, 39),
        chartPoints: sliceChart(39),
      },
      {
        period: '12mo',
        previous: val(allPoints, 52),
        change: pctChange(current, allPoints, 52),
        chartPoints: sliceChart(52),
      },
      {
        period: '24mo',
        previous: val(allPoints, 104),
        change: pctChange(current, allPoints, 104),
        chartPoints: sliceChart(104),
      },
      {
        period: '36mo',
        previous: val(allPoints, 156),
        change: pctChange(current, allPoints, 156),
        chartPoints: sliceChart(156),
      },
    ],
  };
}

// National gas prices via FRED GASREGCOVW (~35 years of weekly data from 1990)
async function fetchNationalGasPricesFRED(): Promise<IndicatorData> {
  const key = getFredKey();
  const twentyYearsAgo = new Date();
  twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
  const startDate = twentyYearsAgo.toISOString().split('T')[0];

  const url = `${FRED_BASE}/series/observations?series_id=GASREGCOVW&api_key=${key}&file_type=json&frequency=w&observation_start=${startDate}&sort_order=desc`;

  const res = await corsFetch(url);
  if (!res.ok) throw new Error(`FRED gas price error: ${res.status}`);
  const json = await res.json();

  const observations: Array<{ date: string; value: string }> = json.observations ?? [];
  const allPoints: ChartPoint[] = observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

  if (allPoints.length === 0) throw new Error('No FRED gas price data');

  const current = allPoints[0].value;
  const currentDate = allPoints[0].date;
  const sliceChart = (weeks: number) => allPoints.slice(0, weeks).reverse();

  return {
    current,
    currentDate,
    unit: '$/gal',
    label: 'Avg Gas Price',
    description:
      'Weekly national average for regular unleaded gasoline (conventional). Prices reflect what consumers pay at the pump and are a key indicator of energy costs and inflation.',
    sourceUrl: 'https://fred.stlouisfed.org/series/GASREGCOVW',
    sourceName: 'EIA via FRED',
    trends: [
      {
        period: '3mo',
        previous: val(allPoints, 13),
        change: pctChange(current, allPoints, 13),
        chartPoints: sliceChart(13),
      },
      {
        period: '6mo',
        previous: val(allPoints, 26),
        change: pctChange(current, allPoints, 26),
        chartPoints: sliceChart(26),
      },
      {
        period: '9mo',
        previous: val(allPoints, 39),
        change: pctChange(current, allPoints, 39),
        chartPoints: sliceChart(39),
      },
      {
        period: '12mo',
        previous: val(allPoints, 52),
        change: pctChange(current, allPoints, 52),
        chartPoints: sliceChart(52),
      },
      {
        period: '24mo',
        previous: val(allPoints, 104),
        change: pctChange(current, allPoints, 104),
        chartPoints: sliceChart(104),
      },
      {
        period: '36mo',
        previous: val(allPoints, 156),
        change: pctChange(current, allPoints, 156),
        chartPoints: sliceChart(156),
      },
      {
        period: '5yr',
        previous: val(allPoints, 260),
        change: pctChange(current, allPoints, 260),
        chartPoints: sliceChart(260),
      },
      {
        period: '10yr',
        previous: val(allPoints, 520),
        change: pctChange(current, allPoints, 520),
        chartPoints: sliceChart(520),
      },
      {
        period: '20yr',
        previous: val(allPoints, 1040),
        change: pctChange(current, allPoints, 1040),
        chartPoints: sliceChart(1040),
      },
    ],
  };
}

// ── Dollar Index / USD Trade Weighted (FRED) ─────────────────────
export async function fetchDollarIndex(): Promise<IndicatorData> {
  const key = getFredKey();
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  const startDate = tenYearsAgo.toISOString().split('T')[0];

  const url = `${FRED_BASE}/series/observations?series_id=DTWEXBGS&api_key=${key}&file_type=json&frequency=m&observation_start=${startDate}&sort_order=desc`;

  const res = await corsFetch(url);
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  const json = await res.json();

  const observations: Array<{ date: string; value: string }> = json.observations ?? [];
  // Newest first — filter out missing values
  const allPoints: ChartPoint[] = observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

  if (allPoints.length === 0) throw new Error('No dollar index data returned');

  const current = allPoints[0].value;
  const currentDate = allPoints[0].date;

  const sliceChart = (months: number) => allPoints.slice(0, months).reverse();

  return {
    current,
    currentDate,
    unit: 'index',
    label: 'US Dollar Index',
    description:
      "Trade-weighted index measuring the dollar's value against a broad basket of foreign currencies. A higher value means the dollar buys more abroad.",
    sourceUrl: 'https://fred.stlouisfed.org/series/DTWEXBGS',
    sourceName: 'Federal Reserve Economic Data (FRED)',
    trends: [
      {
        period: '1yr',
        previous: val(allPoints, 12),
        change: pctChange(current, allPoints, 12),
        chartPoints: sliceChart(12),
      },
      {
        period: '5yr',
        previous: val(allPoints, 60),
        change: pctChange(current, allPoints, 60),
        chartPoints: sliceChart(60),
      },
      {
        period: '10yr',
        previous: val(allPoints, 120),
        change: pctChange(current, allPoints, 120),
        chartPoints: sliceChart(120),
      },
    ],
  };
}

// ── Interest Rates - 10-Year Treasury (FRED) ─────────────────────
export async function fetchInterestRates(): Promise<IndicatorData> {
  const key = getFredKey();
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  const startDate = fiveYearsAgo.toISOString().split('T')[0];

  const url = `${FRED_BASE}/series/observations?series_id=DGS10&api_key=${key}&file_type=json&frequency=m&observation_start=${startDate}&sort_order=desc`;

  const res = await corsFetch(url);
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  const json = await res.json();

  const observations: Array<{ date: string; value: string }> = json.observations ?? [];
  const allPoints: ChartPoint[] = observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

  if (allPoints.length === 0) throw new Error('No interest rate data returned');

  const current = allPoints[0].value;
  const currentDate = allPoints[0].date;

  const sliceChart = (months: number) => allPoints.slice(0, months).reverse();

  return {
    current,
    currentDate,
    unit: '%',
    label: '10-Year Treasury Rate',
    description:
      'Yield on 10-year U.S. Treasury bonds — the benchmark for mortgage rates, car loans, and business borrowing. Higher rates mean borrowing costs more.',
    sourceUrl: 'https://fred.stlouisfed.org/series/DGS10',
    sourceName: 'Federal Reserve Economic Data (FRED)',
    trends: [
      {
        period: '6mo',
        previous: val(allPoints, 6),
        change: pctChange(current, allPoints, 6),
        chartPoints: sliceChart(6),
      },
      {
        period: '1yr',
        previous: val(allPoints, 12),
        change: pctChange(current, allPoints, 12),
        chartPoints: sliceChart(12),
      },
      {
        period: '3yr',
        previous: val(allPoints, 36),
        change: pctChange(current, allPoints, 36),
        chartPoints: sliceChart(36),
      },
      {
        period: '5yr',
        previous: val(allPoints, 60),
        change: pctChange(current, allPoints, 60),
        chartPoints: sliceChart(60),
      },
    ],
  };
}

// ── National Debt (FRED series GFDEBTN — quarterly, in millions) ─
// Treasury FiscalData API uses page[size] brackets which crash React Native's
// fetch polyfill. Using FRED instead — works on all platforms.
export async function fetchNationalDebt(): Promise<IndicatorData> {
  const key = getFredKey();
  const twentyYearsAgo = new Date();
  twentyYearsAgo.setFullYear(twentyYearsAgo.getFullYear() - 20);
  const startDate = twentyYearsAgo.toISOString().split('T')[0];

  const url = `${FRED_BASE}/series/observations?series_id=GFDEBTN&api_key=${key}&file_type=json&frequency=q&observation_start=${startDate}&sort_order=desc`;

  const res = await corsFetch(url);
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  const json = await res.json();

  const observations: Array<{ date: string; value: string }> = json.observations ?? [];
  // FRED values are in millions of dollars — convert to actual dollars
  const allPoints: ChartPoint[] = observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) * 1e6 }));

  if (allPoints.length === 0) throw new Error('No debt data returned');

  // Newest first from API
  const current = allPoints[0].value;
  const currentDate = allPoints[0].date;

  // Quarterly data: ~4 per year, ~80 for 20 years
  const sliceChart = (quarters: number) => allPoints.slice(0, quarters).reverse();

  return {
    current,
    currentDate,
    unit: 'USD',
    label: 'National Debt',
    description:
      'Total outstanding public debt of the U.S. federal government. This is how much the government owes to bondholders, foreign governments, and the public.',
    sourceUrl: 'https://fiscaldata.treasury.gov/datasets/debt-to-the-penny/',
    sourceName: 'U.S. Treasury via FRED',
    trends: [
      {
        period: '1yr',
        previous: val(allPoints, 4),
        change: pctChange(current, allPoints, 4),
        chartPoints: sliceChart(4),
      },
      {
        period: '5yr',
        previous: val(allPoints, 20),
        change: pctChange(current, allPoints, 20),
        chartPoints: sliceChart(20),
      },
      {
        period: '10yr',
        previous: val(allPoints, 40),
        change: pctChange(current, allPoints, 40),
        chartPoints: sliceChart(40),
      },
      {
        period: '20yr',
        previous: val(allPoints, 80),
        change: pctChange(current, allPoints, 80),
        chartPoints: sliceChart(80),
      },
    ],
  };
}

// ── Unemployment Rate — U-3 (FRED) ──────────────────────────────
export async function fetchUnemploymentRate(): Promise<IndicatorData> {
  const key = getFredKey();
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  const startDate = tenYearsAgo.toISOString().split('T')[0];

  const url = `${FRED_BASE}/series/observations?series_id=UNRATE&api_key=${key}&file_type=json&frequency=m&observation_start=${startDate}&sort_order=desc`;

  const res = await corsFetch(url);
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  const json = await res.json();

  const observations: Array<{ date: string; value: string }> = json.observations ?? [];
  const allPoints: ChartPoint[] = observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

  if (allPoints.length === 0) throw new Error('No unemployment data returned');

  const current = allPoints[0].value;
  const currentDate = allPoints[0].date;

  const sliceChart = (months: number) => allPoints.slice(0, months).reverse();

  return {
    current,
    currentDate,
    unit: '%',
    label: 'Unemployment Rate (U-3)',
    description:
      'Official unemployment rate — the percentage of the labor force that is jobless and actively seeking employment. This is the most widely reported unemployment figure.',
    sourceUrl: 'https://fred.stlouisfed.org/series/UNRATE',
    sourceName: 'Bureau of Labor Statistics via FRED',
    trends: [
      {
        period: '6mo',
        previous: val(allPoints, 6),
        change: pctChange(current, allPoints, 6),
        chartPoints: sliceChart(6),
      },
      {
        period: '1yr',
        previous: val(allPoints, 12),
        change: pctChange(current, allPoints, 12),
        chartPoints: sliceChart(12),
      },
      {
        period: '2yr',
        previous: val(allPoints, 24),
        change: pctChange(current, allPoints, 24),
        chartPoints: sliceChart(24),
      },
      {
        period: '3yr',
        previous: val(allPoints, 36),
        change: pctChange(current, allPoints, 36),
        chartPoints: sliceChart(36),
      },
      {
        period: '5yr',
        previous: val(allPoints, 60),
        change: pctChange(current, allPoints, 60),
        chartPoints: sliceChart(60),
      },
      {
        period: '10yr',
        previous: val(allPoints, 120),
        change: pctChange(current, allPoints, 120),
        chartPoints: sliceChart(120),
      },
    ],
  };
}

// ── Broader Unemployment — U-6 (FRED) ──────────────────────────
export async function fetchU6Rate(): Promise<IndicatorData> {
  const key = getFredKey();
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
  const startDate = tenYearsAgo.toISOString().split('T')[0];

  const url = `${FRED_BASE}/series/observations?series_id=U6RATE&api_key=${key}&file_type=json&frequency=m&observation_start=${startDate}&sort_order=desc`;

  const res = await corsFetch(url);
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  const json = await res.json();

  const observations: Array<{ date: string; value: string }> = json.observations ?? [];
  const allPoints: ChartPoint[] = observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

  if (allPoints.length === 0) throw new Error('No U-6 data returned');

  const current = allPoints[0].value;
  const currentDate = allPoints[0].date;

  const sliceChart = (months: number) => allPoints.slice(0, months).reverse();

  return {
    current,
    currentDate,
    unit: '%',
    label: 'Unemployment Rate (U-6)',
    description:
      "Broader unemployment measure — includes the officially unemployed plus discouraged workers who stopped looking, plus people working part-time because they can't find full-time work.",
    sourceUrl: 'https://fred.stlouisfed.org/series/U6RATE',
    sourceName: 'Bureau of Labor Statistics via FRED',
    trends: [
      {
        period: '6mo',
        previous: val(allPoints, 6),
        change: pctChange(current, allPoints, 6),
        chartPoints: sliceChart(6),
      },
      {
        period: '1yr',
        previous: val(allPoints, 12),
        change: pctChange(current, allPoints, 12),
        chartPoints: sliceChart(12),
      },
      {
        period: '2yr',
        previous: val(allPoints, 24),
        change: pctChange(current, allPoints, 24),
        chartPoints: sliceChart(24),
      },
      {
        period: '3yr',
        previous: val(allPoints, 36),
        change: pctChange(current, allPoints, 36),
        chartPoints: sliceChart(36),
      },
      {
        period: '5yr',
        previous: val(allPoints, 60),
        change: pctChange(current, allPoints, 60),
        chartPoints: sliceChart(60),
      },
      {
        period: '10yr',
        previous: val(allPoints, 120),
        change: pctChange(current, allPoints, 120),
        chartPoints: sliceChart(120),
      },
    ],
  };
}

// ── Headline CPI Inflation YoY% (FRED: CPIAUCSL) ─────────────────
export async function fetchCPIInflation(): Promise<IndicatorData> {
  const key = getFredKey();
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const startDate = threeYearsAgo.toISOString().split('T')[0];

  const url = `${FRED_BASE}/series/observations?series_id=CPIAUCSL&api_key=${key}&file_type=json&frequency=m&units=pc1&observation_start=${startDate}&sort_order=desc`;

  const res = await corsFetch(url);
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  const json = await res.json();

  const observations: Array<{ date: string; value: string }> = json.observations ?? [];
  const allPoints: ChartPoint[] = observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

  if (allPoints.length === 0) throw new Error('No CPI data returned');

  const current = allPoints[0].value;
  const currentDate = allPoints[0].date;
  const sliceChart = (months: number) => allPoints.slice(0, months).reverse();

  return {
    current,
    currentDate,
    unit: '%',
    label: 'Inflation Rate (CPI)',
    description:
      'Year-over-year percent change in the Consumer Price Index — how much more expensive everyday goods and services are compared to one year ago. The Federal Reserve targets 2% as healthy.',
    sourceUrl: 'https://fred.stlouisfed.org/series/CPIAUCSL',
    sourceName: 'Bureau of Labor Statistics via FRED',
    trends: [
      {
        period: '6mo',
        previous: val(allPoints, 6),
        change: pctChange(current, allPoints, 6),
        chartPoints: sliceChart(6),
      },
      {
        period: '1yr',
        previous: val(allPoints, 12),
        change: pctChange(current, allPoints, 12),
        chartPoints: sliceChart(12),
      },
      {
        period: '2yr',
        previous: val(allPoints, 24),
        change: pctChange(current, allPoints, 24),
        chartPoints: sliceChart(24),
      },
      {
        period: '3yr',
        previous: val(allPoints, 36),
        change: pctChange(current, allPoints, 36),
        chartPoints: sliceChart(36),
      },
    ],
  };
}

// ── Core CPI (ex food & energy) YoY% (FRED: CPILFESL) ────────────
export async function fetchCoreCPI(): Promise<IndicatorData> {
  const key = getFredKey();
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const startDate = threeYearsAgo.toISOString().split('T')[0];

  const url = `${FRED_BASE}/series/observations?series_id=CPILFESL&api_key=${key}&file_type=json&frequency=m&units=pc1&observation_start=${startDate}&sort_order=desc`;

  const res = await corsFetch(url);
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  const json = await res.json();

  const observations: Array<{ date: string; value: string }> = json.observations ?? [];
  const allPoints: ChartPoint[] = observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

  if (allPoints.length === 0) throw new Error('No core CPI data returned');

  const current = allPoints[0].value;
  const currentDate = allPoints[0].date;
  const sliceChart = (months: number) => allPoints.slice(0, months).reverse();

  return {
    current,
    currentDate,
    unit: '%',
    label: 'Core Inflation (ex-Food & Energy)',
    description:
      'CPI excluding volatile food and energy prices — shows underlying inflation trend. The Federal Reserve watches this closely when deciding whether to raise or lower interest rates.',
    sourceUrl: 'https://fred.stlouisfed.org/series/CPILFESL',
    sourceName: 'Bureau of Labor Statistics via FRED',
    trends: [
      {
        period: '6mo',
        previous: val(allPoints, 6),
        change: pctChange(current, allPoints, 6),
        chartPoints: sliceChart(6),
      },
      {
        period: '1yr',
        previous: val(allPoints, 12),
        change: pctChange(current, allPoints, 12),
        chartPoints: sliceChart(12),
      },
      {
        period: '2yr',
        previous: val(allPoints, 24),
        change: pctChange(current, allPoints, 24),
        chartPoints: sliceChart(24),
      },
      {
        period: '3yr',
        previous: val(allPoints, 36),
        change: pctChange(current, allPoints, 36),
        chartPoints: sliceChart(36),
      },
    ],
  };
}

// ── Food CPI YoY% (FRED: CPIUFDSL) ───────────────────────────────
export async function fetchFoodInflation(): Promise<IndicatorData> {
  const key = getFredKey();
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const startDate = threeYearsAgo.toISOString().split('T')[0];

  const url = `${FRED_BASE}/series/observations?series_id=CPIUFDSL&api_key=${key}&file_type=json&frequency=m&units=pc1&observation_start=${startDate}&sort_order=desc`;

  const res = await corsFetch(url);
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  const json = await res.json();

  const observations: Array<{ date: string; value: string }> = json.observations ?? [];
  const allPoints: ChartPoint[] = observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

  if (allPoints.length === 0) throw new Error('No food CPI data returned');

  const current = allPoints[0].value;
  const currentDate = allPoints[0].date;
  const sliceChart = (months: number) => allPoints.slice(0, months).reverse();

  return {
    current,
    currentDate,
    unit: '%',
    label: 'Grocery Prices (Food CPI)',
    description:
      'Year-over-year change in food prices. Food costs take up a larger percentage of income for lower- and middle-income households, making this a key financial pressure indicator.',
    sourceUrl: 'https://fred.stlouisfed.org/series/CPIUFDSL',
    sourceName: 'Bureau of Labor Statistics via FRED',
    trends: [
      {
        period: '6mo',
        previous: val(allPoints, 6),
        change: pctChange(current, allPoints, 6),
        chartPoints: sliceChart(6),
      },
      {
        period: '1yr',
        previous: val(allPoints, 12),
        change: pctChange(current, allPoints, 12),
        chartPoints: sliceChart(12),
      },
      {
        period: '2yr',
        previous: val(allPoints, 24),
        change: pctChange(current, allPoints, 24),
        chartPoints: sliceChart(24),
      },
      {
        period: '3yr',
        previous: val(allPoints, 36),
        change: pctChange(current, allPoints, 36),
        chartPoints: sliceChart(36),
      },
    ],
  };
}

// ── Shelter / Rent CPI YoY% (FRED: CUSR0000SEHA) ─────────────────
export async function fetchShelterInflation(): Promise<IndicatorData> {
  const key = getFredKey();
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const startDate = threeYearsAgo.toISOString().split('T')[0];

  const url = `${FRED_BASE}/series/observations?series_id=CUSR0000SEHA&api_key=${key}&file_type=json&frequency=m&units=pc1&observation_start=${startDate}&sort_order=desc`;

  const res = await corsFetch(url);
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  const json = await res.json();

  const observations: Array<{ date: string; value: string }> = json.observations ?? [];
  const allPoints: ChartPoint[] = observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

  if (allPoints.length === 0) throw new Error('No shelter CPI data returned');

  const current = allPoints[0].value;
  const currentDate = allPoints[0].date;
  const sliceChart = (months: number) => allPoints.slice(0, months).reverse();

  return {
    current,
    currentDate,
    unit: '%',
    label: 'Housing Costs (Shelter CPI)',
    description:
      'Year-over-year change in rent and housing costs. Shelter is the single largest expense for most households — rising housing costs directly reduce how much money people have left over each month.',
    sourceUrl: 'https://fred.stlouisfed.org/series/CUSR0000SEHA',
    sourceName: 'Bureau of Labor Statistics via FRED',
    trends: [
      {
        period: '6mo',
        previous: val(allPoints, 6),
        change: pctChange(current, allPoints, 6),
        chartPoints: sliceChart(6),
      },
      {
        period: '1yr',
        previous: val(allPoints, 12),
        change: pctChange(current, allPoints, 12),
        chartPoints: sliceChart(12),
      },
      {
        period: '2yr',
        previous: val(allPoints, 24),
        change: pctChange(current, allPoints, 24),
        chartPoints: sliceChart(24),
      },
      {
        period: '3yr',
        previous: val(allPoints, 36),
        change: pctChange(current, allPoints, 36),
        chartPoints: sliceChart(36),
      },
    ],
  };
}

// ── Average Hourly Earnings YoY% (FRED: CES0500000003) ───────────
export async function fetchWageGrowth(): Promise<IndicatorData> {
  const key = getFredKey();
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  const startDate = threeYearsAgo.toISOString().split('T')[0];

  const url = `${FRED_BASE}/series/observations?series_id=CES0500000003&api_key=${key}&file_type=json&frequency=m&units=pc1&observation_start=${startDate}&sort_order=desc`;

  const res = await corsFetch(url);
  if (!res.ok) throw new Error(`FRED API error: ${res.status}`);
  const json = await res.json();

  const observations: Array<{ date: string; value: string }> = json.observations ?? [];
  const allPoints: ChartPoint[] = observations
    .filter((o) => o.value !== '.')
    .map((o) => ({ date: o.date, value: parseFloat(o.value) }));

  if (allPoints.length === 0) throw new Error('No wage data returned');

  const current = allPoints[0].value;
  const currentDate = allPoints[0].date;
  const sliceChart = (months: number) => allPoints.slice(0, months).reverse();

  return {
    current,
    currentDate,
    unit: '%',
    label: 'Wage Growth (Hourly Earnings)',
    description:
      'Year-over-year percent change in average hourly earnings for all private sector workers. When wage growth exceeds the inflation rate, workers gain real purchasing power.',
    sourceUrl: 'https://fred.stlouisfed.org/series/CES0500000003',
    sourceName: 'Bureau of Labor Statistics via FRED',
    trends: [
      {
        period: '6mo',
        previous: val(allPoints, 6),
        change: pctChange(current, allPoints, 6),
        chartPoints: sliceChart(6),
      },
      {
        period: '1yr',
        previous: val(allPoints, 12),
        change: pctChange(current, allPoints, 12),
        chartPoints: sliceChart(12),
      },
      {
        period: '2yr',
        previous: val(allPoints, 24),
        change: pctChange(current, allPoints, 24),
        chartPoints: sliceChart(24),
      },
      {
        period: '3yr',
        previous: val(allPoints, 36),
        change: pctChange(current, allPoints, 36),
        chartPoints: sliceChart(36),
      },
    ],
  };
}

// ── Helpers ──────────────────────────────────────────────────────

/** Get value at index from newest-first array */
function val(points: ChartPoint[], index: number): number | null {
  if (index >= points.length) return points.length > 0 ? points[points.length - 1].value : null;
  return points[index]?.value ?? null;
}

/** Percentage change from current to value at index */
function pctChange(current: number, points: ChartPoint[], index: number): number | null {
  const prev = val(points, index);
  if (prev === null || prev === 0) return null;
  return ((current - prev) / Math.abs(prev)) * 100;
}

// ── Types ────────────────────────────────────────────────────────

export interface ChartPoint {
  date: string;
  value: number;
  president?: string; // key like 'bush', 'obama', 'trump1', 'biden', 'trump2'
}

export interface TrendPoint {
  period: string;
  previous: number | null;
  change: number | null;
  chartPoints?: ChartPoint[];
}

export interface PresidentMarker {
  key: string; // unique: 'bush', 'obama', 'trump1', 'biden', 'trump2'
  name: string; // full: 'Donald Trump (1st Term)'
  shortName: string; // display: 'Trump', 'Obama', etc.
  party: 'R' | 'D';
  startDate: string;
  endDate: string;
}

export interface PollSource {
  pollster: string;
  date: string;
  approve: number;
  disapprove: number;
  sampleSize?: string;
}

export interface IndicatorData {
  current: number;
  currentDate: string;
  unit: string;
  label: string;
  trends: TrendPoint[];
  sourceUrl?: string;
  sourceName?: string;
  description?: string;
  presidentMarkers?: PresidentMarker[];
  sources?: PollSource[];
}

export type GasPriceData = IndicatorData;

// ── Gas Price Regions ─────────────────────────────────────────────
export const GAS_REGIONS = [
  { code: 'NUS', label: 'National' },
  { code: 'R10', label: 'East Coast' },
  { code: 'R20', label: 'Midwest' },
  { code: 'R30', label: 'Gulf Coast' },
  { code: 'R40', label: 'Rocky Mountain' },
  { code: 'R50', label: 'West Coast' },
] as const;

export type GasRegionCode = (typeof GAS_REGIONS)[number]['code'];
