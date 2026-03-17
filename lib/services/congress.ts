// Congress.gov API client
// Docs: https://api.congress.gov/
// Repo: https://github.com/LibraryOfCongress/api.congress.gov
//
// API key: EXPO_PUBLIC_CONGRESS_API_KEY in .env
// Free tier: 5,000 requests/hour

import type {
  CongressMember,
  CongressMemberDetail,
  MemberTerm,
  PartyHistoryEntry,
  SponsoredBill,
  RecentBill,
} from '../types';

const BASE_URL = 'https://api.congress.gov/v3';

/** Current 119th Congress (2025-2027) */
export const CURRENT_CONGRESS = 119;

function getApiKey(): string {
  const key = process.env.EXPO_PUBLIC_CONGRESS_API_KEY;
  if (!key) console.warn('EXPO_PUBLIC_CONGRESS_API_KEY not set in .env');
  return key ?? '';
}

function buildUrl(path: string, params: Record<string, string | number | boolean> = {}): string {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('api_key', getApiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  return url.toString();
}

// ── Raw API shapes ───────────────────────────────────────────────

interface RawMemberItem {
  bioguideId: string;
  name: string; // "LastName, FirstName"
  state: string;
  party?: string;
  partyName?: string;
  district?: number;
  currentMember?: boolean;
  url?: string;
  terms?: {
    item?: Array<{
      chamber: string;
      congress?: number;
      startYear?: number;
      endYear?: number;
    }>;
  };
  depiction?: {
    imageUrl?: string;
    attribution?: string;
  };
}

interface RawMemberDetail {
  bioguideId: string;
  firstName?: string;
  lastName?: string;
  directOrderName?: string;
  invertedOrderName?: string;
  honorificName?: string;
  officialWebsiteUrl?: string;
  party?: string;
  partyName?: string;
  state?: string;
  district?: number;
  currentMember?: boolean;
  url?: string;
  terms?: Array<{
    chamber: string;
    congress?: number;
    startYear?: number;
    endYear?: number;
    stateCode?: string;
    stateName?: string;
    district?: number;
    memberType?: string;
  }>;
  partyHistory?: Array<{
    partyAbbreviation?: string;
    partyName?: string;
    startYear?: number;
    endYear?: number;
  }>;
  addressInformation?: {
    officeAddress?: string;
    city?: string;
    district?: string;
    zipCode?: string;
    phoneNumber?: string;
  };
  depiction?: {
    imageUrl?: string;
  };
}

interface RawSponsoredBill {
  congress?: number;
  number?: string;
  type?: string;
  title?: string;
  introducedDate?: string;
  latestAction?: { actionDate?: string; text?: string };
  policyArea?: { name?: string };
  url?: string;
}

// ── Normalization helpers ────────────────────────────────────────

/** "Democratic" | "Democrat" → "D", "Republican" → "R", "Independent" → "I" */
function normalizeParty(raw: string | undefined): string {
  if (!raw) return '?';
  const u = raw.toUpperCase();
  if (u.startsWith('D')) return 'D';
  if (u.startsWith('R')) return 'R';
  if (u.startsWith('I')) return 'I';
  return raw.charAt(0).toUpperCase();
}

function splitName(invertedName: string): { firstName: string; lastName: string } {
  // API returns "LastName, FirstName MiddleName" for most members
  const commaIdx = invertedName.indexOf(',');
  if (commaIdx === -1) return { firstName: '', lastName: invertedName.trim() };
  const lastName = invertedName.slice(0, commaIdx).trim();
  const firstName = invertedName.slice(commaIdx + 1).trim();
  return { firstName, lastName };
}

/** Derive current chamber from terms array (most recent item). */
function deriveChamber(terms?: RawMemberItem['terms']): 'Senate' | 'House of Representatives' {
  const items = terms?.item;
  if (!items || items.length === 0) return 'House of Representatives';
  // Last item in the array is typically the most recent
  const last = items[items.length - 1];
  return last.chamber?.toLowerCase().includes('senate') ? 'Senate' : 'House of Representatives';
}

function rawToMember(raw: RawMemberItem): CongressMember {
  const { firstName, lastName } = splitName(raw.name ?? '');
  return {
    bioguideId: raw.bioguideId,
    name: raw.name ?? '',
    firstName,
    lastName,
    party: normalizeParty(raw.partyName ?? raw.party),
    partyName: raw.partyName ?? raw.party ?? 'Unknown',
    state: raw.state ?? '',
    chamber: deriveChamber(raw.terms),
    district: raw.district,
    photoUrl: raw.depiction?.imageUrl,
    currentMember: raw.currentMember ?? true,
    url: raw.url ?? '',
  };
}

function rawToMemberDetail(raw: RawMemberDetail): CongressMemberDetail {
  const fallbackName =
    raw.invertedOrderName ?? (raw.lastName ? `${raw.lastName}, ${raw.firstName ?? ''}` : '');
  const { firstName: splitFirst, lastName: splitLast } = splitName(fallbackName);

  const terms: MemberTerm[] = (raw.terms ?? []).map((t) => ({
    chamber: t.chamber ?? '',
    congress: t.congress ?? 0,
    startYear: t.startYear ?? 0,
    endYear: t.endYear,
    stateCode: t.stateCode,
    stateName: t.stateName,
    district: t.district,
    memberType: t.memberType,
  }));

  const partyHistory: PartyHistoryEntry[] = (raw.partyHistory ?? []).map((p) => ({
    partyAbbreviation: p.partyAbbreviation ?? '',
    partyName: p.partyName ?? '',
    startYear: p.startYear ?? 0,
    endYear: p.endYear,
  }));

  // Determine current chamber from most recent term
  const lastTerm = terms[terms.length - 1];
  const chamber: 'Senate' | 'House of Representatives' = lastTerm?.chamber
    ?.toLowerCase()
    .includes('senate')
    ? 'Senate'
    : 'House of Representatives';

  // Build full address string
  let officeAddress: string | undefined;
  const addr = raw.addressInformation;
  if (addr?.officeAddress) {
    const parts = [addr.officeAddress, addr.city, addr.district, addr.zipCode].filter(Boolean);
    officeAddress = parts.join(', ');
  }

  // Party: detail endpoint has no top-level party field — fall back to partyHistory
  const latestPartyEntry =
    raw.partyHistory?.find((p) => !p.endYear) ?? raw.partyHistory?.[raw.partyHistory.length - 1];

  return {
    bioguideId: raw.bioguideId,
    name: raw.invertedOrderName ?? raw.directOrderName ?? '',
    firstName: raw.firstName ?? splitFirst,
    lastName: raw.lastName ?? splitLast,
    honorificName: raw.honorificName,
    party: normalizeParty(
      raw.partyName ??
        raw.party ??
        latestPartyEntry?.partyAbbreviation ??
        latestPartyEntry?.partyName
    ),
    partyName: raw.partyName ?? raw.party ?? latestPartyEntry?.partyName ?? 'Unknown',
    state: raw.state ?? '',
    chamber,
    district: raw.district,
    photoUrl: raw.depiction?.imageUrl,
    currentMember: raw.currentMember ?? true,
    url: raw.url ?? '',
    officialWebsiteUrl: raw.officialWebsiteUrl,
    officeAddress,
    phoneNumber: raw.addressInformation?.phoneNumber,
    terms,
    partyHistory,
  };
}

// ── Public API functions ─────────────────────────────────────────

/**
 * Fetch current US Senators for a state.
 * Uses /member/{stateCode} path — stateCode as query param is not supported by the API.
 * @param stateCode Two-letter uppercase state code, e.g. "CA"
 */
export async function fetchSenators(stateCode: string): Promise<CongressMember[]> {
  const url = buildUrl(`/member/${stateCode.toUpperCase()}`, {
    currentMember: true,
    limit: 10,
  });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Congress API error ${res.status}: ${res.statusText}`);
  const json = await res.json();

  const members: RawMemberItem[] = json.members ?? [];
  return members.map(rawToMember).filter((m) => m.chamber === 'Senate');
}

/**
 * Fetch current House members for a state.
 * Uses /member/{stateCode} path — stateCode as query param is not supported by the API.
 * @param stateCode Two-letter uppercase state code, e.g. "CA"
 */
export async function fetchHouseMembers(stateCode: string): Promise<CongressMember[]> {
  const url = buildUrl(`/member/${stateCode.toUpperCase()}`, {
    currentMember: true,
    limit: 75, // Largest delegation is California with 52 seats
  });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Congress API error ${res.status}: ${res.statusText}`);
  const json = await res.json();

  const members: RawMemberItem[] = json.members ?? [];
  return members
    .map(rawToMember)
    .filter((m) => m.chamber === 'House of Representatives')
    .sort((a, b) => (a.district ?? 0) - (b.district ?? 0));
}

/**
 * Fetch full details for a single member by bioguide ID.
 * @param bioguideId e.g. "A000374"
 */
export async function fetchMemberDetails(bioguideId: string): Promise<CongressMemberDetail> {
  const url = buildUrl(`/member/${bioguideId}`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Congress API error ${res.status}: ${res.statusText}`);
  const json = await res.json();

  return rawToMemberDetail(json.member as RawMemberDetail);
}

/**
 * Fetch recent legislation sponsored by a member.
 * @param bioguideId e.g. "A000374"
 * @param limit Number of bills to return (default 20)
 */
export async function fetchSponsoredLegislation(
  bioguideId: string,
  limit = 20
): Promise<SponsoredBill[]> {
  const url = buildUrl(`/member/${bioguideId}/sponsored-legislation`, {
    limit,
    offset: 0,
  });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Congress API error ${res.status}: ${res.statusText}`);
  const json = await res.json();

  const bills: RawSponsoredBill[] = json.sponsoredLegislation ?? [];
  return bills.map((b) => ({
    congress: b.congress ?? CURRENT_CONGRESS,
    number: b.number ?? '',
    type: b.type ?? '',
    title: b.title ?? 'Untitled',
    introducedDate: b.introducedDate ?? '',
    latestAction: b.latestAction
      ? { actionDate: b.latestAction.actionDate ?? '', text: b.latestAction.text ?? '' }
      : undefined,
    policyArea: b.policyArea?.name,
    url: b.url ?? '',
  }));
}

// ── Raw bill list shape ──────────────────────────────────────────

interface RawBillListItem {
  congress?: number;
  number?: string;
  type?: string;
  title?: string;
  originChamber?: string;
  updateDate?: string;
  url?: string;
  policyArea?: { name?: string };
  latestAction?: { actionDate?: string; text?: string };
  sponsors?: Array<{ firstName?: string; lastName?: string }>;
}

/**
 * Fetch the most recently updated bills from the current Congress.
 * Uses GET /bill/{congress}?sort=updateDate+desc
 * @param limit Number of bills to return (default 10)
 */
export async function fetchRecentBills(limit = 10): Promise<RecentBill[]> {
  const url = buildUrl(`/bill/${CURRENT_CONGRESS}`, {
    sort: 'updateDate+desc',
    limit,
  });

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Congress API error ${res.status}: ${res.statusText}`);
  const json = await res.json();

  const bills: RawBillListItem[] = json.bills ?? [];
  return bills.map((b) => {
    const sponsor = b.sponsors?.[0];
    const sponsorName = sponsor
      ? `${sponsor.firstName ?? ''} ${sponsor.lastName ?? ''}`.trim()
      : undefined;
    const chamber = b.originChamber?.toLowerCase().includes('senate') ? 'Senate' : 'House';
    return {
      congress: b.congress ?? CURRENT_CONGRESS,
      number: b.number ?? '',
      type: b.type ?? '',
      title: b.title ?? 'Untitled',
      originChamber: chamber,
      latestAction: b.latestAction
        ? { actionDate: b.latestAction.actionDate ?? '', text: b.latestAction.text ?? '' }
        : undefined,
      updateDate: b.updateDate ?? '',
      url: b.url ?? '',
      policyArea: b.policyArea?.name,
      sponsorName,
    };
  });
}
