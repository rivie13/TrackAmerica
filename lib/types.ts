// Shared TypeScript types for TrackAmerica

// ============================================
// Core Domain Types
// ============================================

export interface Representative {
  id: string;
  bioguideId: string;
  firstName: string;
  lastName: string;
  party: string;
  state: string;
  chamber: 'Senate' | 'House';
  district?: string;
  photoUrl?: string;
}

export interface Bill {
  id: string;
  billNumber: string;
  title: string;
  sponsor?: string;
  congress: number;
  introducedDate?: string;
  summary?: string;
}

export interface Vote {
  id: string;
  repId: string;
  billId: string;
  voteValue: 'Yea' | 'Nay' | 'Present' | 'Not Voting';
  voteDate: string;
}

// ============================================
// Congress.gov API Types
// ============================================

export type PartyCode = 'D' | 'R' | 'I' | string;

/** Lightweight member record returned by the /member list endpoint */
export interface CongressMember {
  bioguideId: string;
  name: string; // "LastName, FirstName" format from API
  firstName: string;
  lastName: string;
  party: PartyCode;
  partyName: string; // "Democratic" | "Republican" | "Independent"
  state: string; // two-letter code e.g. "CA"
  chamber: 'Senate' | 'House of Representatives';
  district?: number; // House only
  photoUrl?: string;
  currentMember: boolean;
  /** URL to the member's page on congress.gov */
  url: string;
}

/** Full member detail from /member/{bioguideId} */
export interface CongressMemberDetail extends CongressMember {
  honorificName?: string;
  officialWebsiteUrl?: string;
  officeAddress?: string;
  phoneNumber?: string;
  terms: MemberTerm[];
  partyHistory: PartyHistoryEntry[];
}

export interface MemberTerm {
  chamber: string;
  congress: number;
  startYear: number;
  endYear?: number;
  stateCode?: string;
  stateName?: string;
  district?: number;
  memberType?: string;
}

export interface PartyHistoryEntry {
  partyAbbreviation: string;
  partyName: string;
  startYear: number;
  endYear?: number;
}

/** Bill from sponsored-legislation endpoint */
export interface SponsoredBill {
  congress: number;
  number: string;
  type: string; // "HR", "S", "HJRES", etc.
  title: string;
  introducedDate: string;
  latestAction?: {
    actionDate: string;
    text: string;
  };
  policyArea?: string;
  url: string;
}
