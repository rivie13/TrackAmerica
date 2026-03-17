// TanStack Query hooks for all national dashboard data

import { useQuery } from '@tanstack/react-query';
import {
  fetchGasPrices,
  fetchDollarIndex,
  fetchInterestRates,
  fetchNationalDebt,
  fetchUnemploymentRate,
  fetchU6Rate,
  fetchCPIInflation,
  fetchCoreCPI,
  fetchFoodInflation,
  fetchShelterInflation,
  fetchWageGrowth,
} from '../services/economic';
import type { IndicatorData, GasRegionCode } from '../services/economic';
import {
  fetchPresidentApproval,
  fetchCongressApproval,
  fetchSupremeCourtApproval,
} from '../services/approval';

export function useGasPrices(regionCode: GasRegionCode = 'NUS') {
  return useQuery<IndicatorData>({
    queryKey: ['gasPrices', regionCode],
    queryFn: () => fetchGasPrices(regionCode),
    staleTime: 8 * 60 * 60 * 1000, // 8 hours — gas prices update weekly
    gcTime: 24 * 60 * 60 * 1000, // keep in memory 24h
  });
}

export function useDollarIndex() {
  return useQuery<IndicatorData>({
    queryKey: ['dollarIndex'],
    queryFn: fetchDollarIndex,
    staleTime: 60 * 60 * 1000,
  });
}

export function useInterestRates() {
  return useQuery<IndicatorData>({
    queryKey: ['interestRates'],
    queryFn: fetchInterestRates,
    staleTime: 60 * 60 * 1000,
  });
}

export function useNationalDebt() {
  return useQuery<IndicatorData>({
    queryKey: ['nationalDebt'],
    queryFn: fetchNationalDebt,
    staleTime: 4 * 60 * 60 * 1000, // 4 hours — debt updates daily
  });
}

export function useUnemploymentRate() {
  return useQuery<IndicatorData>({
    queryKey: ['unemploymentRate'],
    queryFn: fetchUnemploymentRate,
    staleTime: 8 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useU6Rate() {
  return useQuery<IndicatorData>({
    queryKey: ['u6Rate'],
    queryFn: fetchU6Rate,
    staleTime: 8 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useCPIInflation() {
  return useQuery<IndicatorData>({
    queryKey: ['cpiInflation'],
    queryFn: fetchCPIInflation,
    staleTime: 12 * 60 * 60 * 1000, // 12 hours — CPI updates monthly
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useCoreCPI() {
  return useQuery<IndicatorData>({
    queryKey: ['coreCPI'],
    queryFn: fetchCoreCPI,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useFoodInflation() {
  return useQuery<IndicatorData>({
    queryKey: ['foodInflation'],
    queryFn: fetchFoodInflation,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useShelterInflation() {
  return useQuery<IndicatorData>({
    queryKey: ['shelterInflation'],
    queryFn: fetchShelterInflation,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function useWageGrowth() {
  return useQuery<IndicatorData>({
    queryKey: ['wageGrowth'],
    queryFn: fetchWageGrowth,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
}

export function usePresidentApproval() {
  return useQuery<IndicatorData>({
    queryKey: ['presidentApproval'],
    queryFn: fetchPresidentApproval,
    staleTime: 4 * 60 * 60 * 1000,
  });
}

export function useCongressApproval() {
  return useQuery<IndicatorData>({
    queryKey: ['congressApproval'],
    queryFn: fetchCongressApproval,
    staleTime: 4 * 60 * 60 * 1000,
  });
}

export function useSupremeCourtApproval() {
  return useQuery<IndicatorData>({
    queryKey: ['scotusApproval'],
    queryFn: fetchSupremeCourtApproval,
    staleTime: 24 * 60 * 60 * 1000, // daily — static data
  });
}
