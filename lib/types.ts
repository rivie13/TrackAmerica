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
