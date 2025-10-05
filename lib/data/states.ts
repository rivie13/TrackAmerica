/**
 * State Data Module
 *
 * Contains state metadata including:
 * - Full state names
 * - Abbreviations
 * - FIPS codes
 * - Political leanings (for color coding)
 * - Population data (future)
 * - Representative counts (future)
 */

export interface StateInfo {
  code: string; // Two-letter abbreviation (lowercase)
  name: string; // Full state name
  fips: string; // FIPS code for TopoJSON mapping
  political: 'red' | 'blue' | 'purple' | 'neutral'; // Political leaning
  displayName: string; // Display name (can differ from 'name')
}

/**
 * Map of state codes to full state information
 *
 * Political classifications (as of 2024):
 * - 'red': Solidly Republican
 * - 'blue': Solidly Democratic
 * - 'purple': Swing state / Competitive
 * - 'neutral': Territories or special districts
 *
 * TODO: Replace with dynamic data from API (voting records, polling data)
 * TODO: Add population, electoral votes, representative counts
 */
export const STATE_INFO: Record<string, StateInfo> = {
  al: { code: 'al', name: 'Alabama', fips: '01', political: 'red', displayName: 'Alabama' },
  ak: { code: 'ak', name: 'Alaska', fips: '02', political: 'red', displayName: 'Alaska' },
  az: { code: 'az', name: 'Arizona', fips: '04', political: 'purple', displayName: 'Arizona' },
  ar: { code: 'ar', name: 'Arkansas', fips: '05', political: 'red', displayName: 'Arkansas' },
  ca: { code: 'ca', name: 'California', fips: '06', political: 'blue', displayName: 'California' },
  co: { code: 'co', name: 'Colorado', fips: '08', political: 'blue', displayName: 'Colorado' },
  ct: {
    code: 'ct',
    name: 'Connecticut',
    fips: '09',
    political: 'blue',
    displayName: 'Connecticut',
  },
  de: { code: 'de', name: 'Delaware', fips: '10', political: 'blue', displayName: 'Delaware' },
  dc: {
    code: 'dc',
    name: 'District of Columbia',
    fips: '11',
    political: 'blue',
    displayName: 'Washington, D.C.',
  },
  fl: { code: 'fl', name: 'Florida', fips: '12', political: 'red', displayName: 'Florida' },
  ga: { code: 'ga', name: 'Georgia', fips: '13', political: 'purple', displayName: 'Georgia' },
  hi: { code: 'hi', name: 'Hawaii', fips: '15', political: 'blue', displayName: 'Hawaii' },
  id: { code: 'id', name: 'Idaho', fips: '16', political: 'red', displayName: 'Idaho' },
  il: { code: 'il', name: 'Illinois', fips: '17', political: 'blue', displayName: 'Illinois' },
  in: { code: 'in', name: 'Indiana', fips: '18', political: 'red', displayName: 'Indiana' },
  ia: { code: 'ia', name: 'Iowa', fips: '19', political: 'purple', displayName: 'Iowa' },
  ks: { code: 'ks', name: 'Kansas', fips: '20', political: 'red', displayName: 'Kansas' },
  ky: { code: 'ky', name: 'Kentucky', fips: '21', political: 'red', displayName: 'Kentucky' },
  la: { code: 'la', name: 'Louisiana', fips: '22', political: 'red', displayName: 'Louisiana' },
  me: { code: 'me', name: 'Maine', fips: '23', political: 'blue', displayName: 'Maine' },
  md: { code: 'md', name: 'Maryland', fips: '24', political: 'blue', displayName: 'Maryland' },
  ma: {
    code: 'ma',
    name: 'Massachusetts',
    fips: '25',
    political: 'blue',
    displayName: 'Massachusetts',
  },
  mi: { code: 'mi', name: 'Michigan', fips: '26', political: 'purple', displayName: 'Michigan' },
  mn: { code: 'mn', name: 'Minnesota', fips: '27', political: 'blue', displayName: 'Minnesota' },
  ms: { code: 'ms', name: 'Mississippi', fips: '28', political: 'red', displayName: 'Mississippi' },
  mo: { code: 'mo', name: 'Missouri', fips: '29', political: 'red', displayName: 'Missouri' },
  mt: { code: 'mt', name: 'Montana', fips: '30', political: 'red', displayName: 'Montana' },
  ne: { code: 'ne', name: 'Nebraska', fips: '31', political: 'red', displayName: 'Nebraska' },
  nv: { code: 'nv', name: 'Nevada', fips: '32', political: 'purple', displayName: 'Nevada' },
  nh: {
    code: 'nh',
    name: 'New Hampshire',
    fips: '33',
    political: 'purple',
    displayName: 'New Hampshire',
  },
  nj: { code: 'nj', name: 'New Jersey', fips: '34', political: 'blue', displayName: 'New Jersey' },
  nm: { code: 'nm', name: 'New Mexico', fips: '35', political: 'blue', displayName: 'New Mexico' },
  ny: { code: 'ny', name: 'New York', fips: '36', political: 'blue', displayName: 'New York' },
  nc: {
    code: 'nc',
    name: 'North Carolina',
    fips: '37',
    political: 'purple',
    displayName: 'North Carolina',
  },
  nd: {
    code: 'nd',
    name: 'North Dakota',
    fips: '38',
    political: 'red',
    displayName: 'North Dakota',
  },
  oh: { code: 'oh', name: 'Ohio', fips: '39', political: 'purple', displayName: 'Ohio' },
  ok: { code: 'ok', name: 'Oklahoma', fips: '40', political: 'red', displayName: 'Oklahoma' },
  or: { code: 'or', name: 'Oregon', fips: '41', political: 'blue', displayName: 'Oregon' },
  pa: {
    code: 'pa',
    name: 'Pennsylvania',
    fips: '42',
    political: 'purple',
    displayName: 'Pennsylvania',
  },
  ri: {
    code: 'ri',
    name: 'Rhode Island',
    fips: '44',
    political: 'blue',
    displayName: 'Rhode Island',
  },
  sc: {
    code: 'sc',
    name: 'South Carolina',
    fips: '45',
    political: 'red',
    displayName: 'South Carolina',
  },
  sd: {
    code: 'sd',
    name: 'South Dakota',
    fips: '46',
    political: 'red',
    displayName: 'South Dakota',
  },
  tn: { code: 'tn', name: 'Tennessee', fips: '47', political: 'red', displayName: 'Tennessee' },
  tx: { code: 'tx', name: 'Texas', fips: '48', political: 'red', displayName: 'Texas' },
  ut: { code: 'ut', name: 'Utah', fips: '49', political: 'red', displayName: 'Utah' },
  vt: { code: 'vt', name: 'Vermont', fips: '50', political: 'blue', displayName: 'Vermont' },
  va: { code: 'va', name: 'Virginia', fips: '51', political: 'blue', displayName: 'Virginia' },
  wa: { code: 'wa', name: 'Washington', fips: '53', political: 'blue', displayName: 'Washington' },
  wv: {
    code: 'wv',
    name: 'West Virginia',
    fips: '54',
    political: 'red',
    displayName: 'West Virginia',
  },
  wi: { code: 'wi', name: 'Wisconsin', fips: '55', political: 'purple', displayName: 'Wisconsin' },
  wy: { code: 'wy', name: 'Wyoming', fips: '56', political: 'red', displayName: 'Wyoming' },
  // Territories
  as: {
    code: 'as',
    name: 'American Samoa',
    fips: '60',
    political: 'neutral',
    displayName: 'American Samoa',
  },
  gu: { code: 'gu', name: 'Guam', fips: '66', political: 'neutral', displayName: 'Guam' },
  mp: {
    code: 'mp',
    name: 'Northern Mariana Islands',
    fips: '69',
    political: 'neutral',
    displayName: 'Northern Mariana Islands',
  },
  pr: {
    code: 'pr',
    name: 'Puerto Rico',
    fips: '72',
    political: 'neutral',
    displayName: 'Puerto Rico',
  },
  um: {
    code: 'um',
    name: 'U.S. Minor Outlying Islands',
    fips: '74',
    political: 'neutral',
    displayName: 'U.S. Minor Outlying Islands',
  },
  vi: {
    code: 'vi',
    name: 'U.S. Virgin Islands',
    fips: '78',
    political: 'neutral',
    displayName: 'U.S. Virgin Islands',
  },
};

/**
 * Get state information by abbreviation code
 */
export function getStateInfo(code: string): StateInfo | undefined {
  return STATE_INFO[code.toLowerCase()];
}

/**
 * Get state information by FIPS code
 */
export function getStateByFips(fips: string): StateInfo | undefined {
  return Object.values(STATE_INFO).find((state) => state.fips === fips);
}

/**
 * Get color for state based on political leaning
 * Returns Tailwind-compatible color values
 */
export function getStateColor(political: StateInfo['political']): {
  fill: string;
  stroke: string;
  textColor: string;
} {
  switch (political) {
    case 'red':
      return {
        fill: '#dc2626', // red-600
        stroke: '#991b1b', // red-800
        textColor: '#dc2626', // red-600
      };
    case 'blue':
      return {
        fill: '#2563eb', // blue-600
        stroke: '#1e40af', // blue-800
        textColor: '#2563eb', // blue-600
      };
    case 'purple':
      return {
        fill: '#9333ea', // purple-600
        stroke: '#6b21a8', // purple-800
        textColor: '#9333ea', // purple-600
      };
    case 'neutral':
      return {
        fill: '#6b7280', // gray-500
        stroke: '#374151', // gray-700
        textColor: '#6b7280', // gray-500
      };
  }
}

/**
 * Get all states grouped by political leaning
 */
export function getStatesByPolitical() {
  return {
    red: Object.values(STATE_INFO).filter((s) => s.political === 'red'),
    blue: Object.values(STATE_INFO).filter((s) => s.political === 'blue'),
    purple: Object.values(STATE_INFO).filter((s) => s.political === 'purple'),
    neutral: Object.values(STATE_INFO).filter((s) => s.political === 'neutral'),
  };
}
