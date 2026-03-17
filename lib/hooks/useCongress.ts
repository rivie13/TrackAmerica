// TanStack Query hooks for Congress.gov API data

import { useQuery } from '@tanstack/react-query';
import {
  fetchSenators,
  fetchHouseMembers,
  fetchMemberDetails,
  fetchSponsoredLegislation,
} from '../services/congress';
import type { CongressMember, CongressMemberDetail, SponsoredBill } from '../types';

/** Fetch current US Senators for a state. Stale for 24 hours (senator data rarely changes). */
export function useSenators(stateCode: string | undefined) {
  return useQuery<CongressMember[]>({
    queryKey: ['senators', stateCode?.toUpperCase()],
    queryFn: () => fetchSenators(stateCode!),
    enabled: !!stateCode,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
  });
}

/** Fetch current House members for a state, sorted by district. Stale for 24 hours. */
export function useHouseMembers(stateCode: string | undefined) {
  return useQuery<CongressMember[]>({
    queryKey: ['houseMembers', stateCode?.toUpperCase()],
    queryFn: () => fetchHouseMembers(stateCode!),
    enabled: !!stateCode,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 48 * 60 * 60 * 1000,
  });
}

/** Fetch full detail for a single member. Stale for 12 hours. */
export function useMemberDetails(bioguideId: string | undefined) {
  return useQuery<CongressMemberDetail>({
    queryKey: ['memberDetails', bioguideId],
    queryFn: () => fetchMemberDetails(bioguideId!),
    enabled: !!bioguideId,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

/** Fetch sponsored legislation for a member. Stale for 6 hours. */
export function useSponsoredLegislation(bioguideId: string | undefined, limit = 20) {
  return useQuery<SponsoredBill[]>({
    queryKey: ['sponsoredLegislation', bioguideId, limit],
    queryFn: () => fetchSponsoredLegislation(bioguideId!, limit),
    enabled: !!bioguideId,
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 12 * 60 * 60 * 1000,
  });
}
