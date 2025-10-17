/**
 * Congressional district data and helpers.
 * District counts based on current apportionment (118th-119th Congress).
 */

export interface DistrictInfo {
  state: string; // Two-letter state code (e.g., "PA")
  district: number; // District number (1-indexed, 0 for at-large)
  // Political data (will come from Congress.gov API in future):
  representative?: string;
  party?: 'R' | 'D' | 'I';
  lastUpdated?: string;
}

/**
 * Number of congressional districts per state.
 * Total: 435 districts across all states.
 */
export const STATE_DISTRICT_COUNTS: Record<string, number> = {
  // States with at-large districts (1 representative)
  ak: 1, // Alaska
  de: 1, // Delaware
  nd: 1, // North Dakota
  sd: 1, // South Dakota
  vt: 1, // Vermont
  wy: 1, // Wyoming

  // States with multiple districts
  al: 7, // Alabama
  ar: 4, // Arkansas
  az: 9, // Arizona
  ca: 52, // California
  co: 8, // Colorado
  ct: 5, // Connecticut
  fl: 28, // Florida
  ga: 14, // Georgia
  hi: 2, // Hawaii
  ia: 4, // Iowa
  id: 2, // Idaho
  il: 17, // Illinois
  in: 9, // Indiana
  ks: 4, // Kansas
  ky: 6, // Kentucky
  la: 6, // Louisiana
  ma: 9, // Massachusetts
  md: 8, // Maryland
  me: 2, // Maine
  mi: 13, // Michigan
  mn: 8, // Minnesota
  mo: 8, // Missouri
  ms: 4, // Mississippi
  mt: 2, // Montana
  nc: 14, // North Carolina
  ne: 3, // Nebraska
  nh: 2, // New Hampshire
  nj: 12, // New Jersey
  nm: 3, // New Mexico
  nv: 4, // Nevada
  ny: 26, // New York
  oh: 15, // Ohio
  ok: 5, // Oklahoma
  or: 6, // Oregon
  pa: 17, // Pennsylvania
  ri: 2, // Rhode Island
  sc: 7, // South Carolina
  tn: 9, // Tennessee
  tx: 38, // Texas
  ut: 4, // Utah
  va: 11, // Virginia
  wa: 10, // Washington
  wi: 8, // Wisconsin
  wv: 2, // West Virginia
};

/**
 * Get array of district numbers for a state.
 * @param stateCode Two-letter state code (case-insensitive)
 * @returns Array of district numbers (1-indexed for multi-district states, [0] for at-large)
 * @example
 * getDistrictsForState('PA') // [1, 2, 3, ..., 17]
 * getDistrictsForState('WY') // [0] (at-large)
 */
export function getDistrictsForState(stateCode: string): number[] {
  const count = STATE_DISTRICT_COUNTS[stateCode.toLowerCase()];

  if (!count) {
    console.warn(`Unknown state code: ${stateCode}`);
    return [];
  }

  // At-large districts use 0, multi-district states use 1-indexed
  if (count === 1) {
    return [0];
  }

  return Array.from({ length: count }, (_, i) => i + 1);
}

/**
 * Get total number of districts for a state.
 * @param stateCode Two-letter state code (case-insensitive)
 * @returns Number of districts, or 0 if state not found
 */
export function getDistrictCount(stateCode: string): number {
  return STATE_DISTRICT_COUNTS[stateCode.toLowerCase()] || 0;
}

/**
 * Check if a state has at-large representation (single district).
 * @param stateCode Two-letter state code (case-insensitive)
 */
export function isAtLargeState(stateCode: string): boolean {
  return getDistrictCount(stateCode) === 1;
}

/**
 * TODO: Future - fetch political data from Congress.gov API
 * For now, returns null (districts will render without party colors)
 */
export async function getDistrictPoliticalData(
  _state: string,
  _district: number
): Promise<DistrictInfo | null> {
  // Placeholder - will call Congress.gov API in future
  // For now, return null so districts render gray (no party color)
  return null;
}
