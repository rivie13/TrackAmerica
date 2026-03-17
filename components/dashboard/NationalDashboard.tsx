import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { IndicatorCard } from './IndicatorCard';
import { MiddleClassHealthScore } from './MiddleClassHealthScore';
import {
  useGasPrices,
  useDollarIndex,
  useInterestRates,
  useNationalDebt,
  useUnemploymentRate,
  useU6Rate,
  useCPIInflation,
  useCoreCPI,
  useFoodInflation,
  useShelterInflation,
  useWageGrowth,
  usePresidentApproval,
  useCongressApproval,
  useSupremeCourtApproval,
} from '@/lib/hooks/useNationalData';
import { GAS_REGIONS } from '@/lib/services/economic';
import type { GasRegionCode } from '@/lib/services/economic';

function SectionDivider({ label, delay = 0 }: { label: string; delay?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(500)}>
      <View className="flex-row items-center mb-3">
        <View className="h-px flex-1 bg-gray-200" />
        <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mx-3">
          {label}
        </Text>
        <View className="h-px flex-1 bg-gray-200" />
      </View>
    </Animated.View>
  );
}

export function NationalDashboard() {
  const [gasRegion, setGasRegion] = useState<GasRegionCode>('NUS');
  const { width: screenWidth } = useWindowDimensions();

  // Single column on mobile (< 600px), 2-column on wider screens
  const isNarrow = screenWidth < 600;

  const gasPrices = useGasPrices(gasRegion);
  const dollarIndex = useDollarIndex();
  const interestRates = useInterestRates();
  const nationalDebt = useNationalDebt();
  const unemploymentRate = useUnemploymentRate();
  const u6Rate = useU6Rate();
  const cpiInflation = useCPIInflation();
  const coreCPI = useCoreCPI();
  const foodInflation = useFoodInflation();
  const shelterInflation = useShelterInflation();
  const wageGrowth = useWageGrowth();
  const presidentApproval = usePresidentApproval();
  const congressApproval = useCongressApproval();
  const scotusApproval = useSupremeCourtApproval();

  const cardWidth = isNarrow ? '100%' : '48%';
  const approvalCardWidth = isNarrow ? '100%' : '31%';

  // Health score is loading until all 8 inputs are ready
  const healthScoreLoading =
    cpiInflation.isLoading ||
    coreCPI.isLoading ||
    unemploymentRate.isLoading ||
    u6Rate.isLoading ||
    gasPrices.isLoading ||
    foodInflation.isLoading ||
    shelterInflation.isLoading ||
    wageGrowth.isLoading;

  return (
    <View className="w-full">
      {/* Section Header */}
      <Animated.View entering={FadeInDown.duration(500)} className="mb-5">
        <View className="flex-row items-center mb-1">
          <View className="w-1 h-6 rounded-full bg-blue-600 mr-2" />
          <Text className="text-xl font-bold text-gray-900">How Is America Doing?</Text>
        </View>
        <Text className="text-sm text-gray-500 ml-3">
          Real-time open data from official government sources
        </Text>
      </Animated.View>

      {/* ─── Working Class Health Score ─── */}
      <MiddleClassHealthScore
        cpi={cpiInflation.data}
        coreCpi={coreCPI.data}
        unemployment={unemploymentRate.data}
        unemployment6={u6Rate.data}
        gasPrice={gasPrices.data}
        foodCpi={foodInflation.data}
        shelterCpi={shelterInflation.data}
        wageGrowth={wageGrowth.data}
        isLoading={healthScoreLoading}
        delay={80}
      />

      {/* ─── Economy Section ─── */}
      <SectionDivider label="Economy" delay={100} />

      {/* Gas Region Selector */}
      <Animated.View entering={FadeInDown.delay(120).duration(400)} className="mb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 6, paddingVertical: 2 }}
        >
          {GAS_REGIONS.map((region) => (
            <Pressable
              key={region.code}
              onPress={() => setGasRegion(region.code)}
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: gasRegion === region.code ? '#d97706' : '#f1f5f9',
              }}
            >
              <Text
                className="text-[10px] font-semibold"
                style={{ color: gasRegion === region.code ? '#ffffff' : '#64748b' }}
              >
                {region.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      <View className="flex-row flex-wrap mb-5" style={{ gap: 10 }}>
        <View style={{ width: cardWidth }}>
          <IndicatorCard
            data={gasPrices.data}
            isLoading={gasPrices.isLoading}
            isError={gasPrices.isError}
            onRetry={() => gasPrices.refetch()}
            icon={'\u26FD'}
            accentColor="#d97706"
            delay={150}
          />
        </View>
        <View style={{ width: cardWidth }}>
          <IndicatorCard
            data={dollarIndex.data}
            isLoading={dollarIndex.isLoading}
            isError={dollarIndex.isError}
            onRetry={() => dollarIndex.refetch()}
            icon={'\uD83D\uDCB5'}
            accentColor="#059669"
            delay={200}
          />
        </View>
        <View style={{ width: cardWidth }}>
          <IndicatorCard
            data={interestRates.data}
            isLoading={interestRates.isLoading}
            isError={interestRates.isError}
            onRetry={() => interestRates.refetch()}
            icon={'\uD83C\uDFE6'}
            accentColor="#4f46e5"
            delay={250}
          />
        </View>
        <View style={{ width: cardWidth }}>
          <IndicatorCard
            data={nationalDebt.data}
            isLoading={nationalDebt.isLoading}
            isError={nationalDebt.isError}
            onRetry={() => nationalDebt.refetch()}
            icon={'\uD83D\uDCC9'}
            accentColor="#dc2626"
            delay={300}
          />
        </View>
      </View>

      {/* ─── Inflation Section ─── */}
      <SectionDivider label="Inflation" delay={310} />

      <View className="flex-row flex-wrap mb-5" style={{ gap: 10 }}>
        <View style={{ width: cardWidth }}>
          <IndicatorCard
            data={cpiInflation.data}
            isLoading={cpiInflation.isLoading}
            isError={cpiInflation.isError}
            onRetry={() => cpiInflation.refetch()}
            icon={'\uD83D\uDCC8'}
            accentColor="#dc2626"
            delay={320}
          />
        </View>
        <View style={{ width: cardWidth }}>
          <IndicatorCard
            data={coreCPI.data}
            isLoading={coreCPI.isLoading}
            isError={coreCPI.isError}
            onRetry={() => coreCPI.refetch()}
            icon={'\uD83D\uDD35'}
            accentColor="#9333ea"
            delay={350}
          />
        </View>
        <View style={{ width: cardWidth }}>
          <IndicatorCard
            data={foodInflation.data}
            isLoading={foodInflation.isLoading}
            isError={foodInflation.isError}
            onRetry={() => foodInflation.refetch()}
            icon={'\uD83C\uDF6B'}
            accentColor="#ea580c"
            delay={380}
          />
        </View>
        <View style={{ width: cardWidth }}>
          <IndicatorCard
            data={shelterInflation.data}
            isLoading={shelterInflation.isLoading}
            isError={shelterInflation.isError}
            onRetry={() => shelterInflation.refetch()}
            icon={'\uD83C\uDFE0'}
            accentColor="#0891b2"
            delay={410}
          />
        </View>
        <View style={{ width: cardWidth }}>
          <IndicatorCard
            data={wageGrowth.data}
            isLoading={wageGrowth.isLoading}
            isError={wageGrowth.isError}
            onRetry={() => wageGrowth.refetch()}
            icon={'\uD83D\uDCB0'}
            accentColor="#16a34a"
            delay={440}
          />
        </View>
      </View>

      {/* ─── Employment Section ─── */}
      <SectionDivider label="Employment" delay={460} />

      <View className="flex-row flex-wrap mb-5" style={{ gap: 10 }}>
        <View style={{ width: cardWidth }}>
          <IndicatorCard
            data={unemploymentRate.data}
            isLoading={unemploymentRate.isLoading}
            isError={unemploymentRate.isError}
            onRetry={() => unemploymentRate.refetch()}
            icon={'\uD83D\uDCBC'}
            accentColor="#0891b2"
            delay={480}
          />
        </View>
        <View style={{ width: cardWidth }}>
          <IndicatorCard
            data={u6Rate.data}
            isLoading={u6Rate.isLoading}
            isError={u6Rate.isError}
            onRetry={() => u6Rate.refetch()}
            icon={'\uD83D\uDCC4'}
            accentColor="#6366f1"
            delay={510}
          />
        </View>
      </View>

      {/* ─── Approval Ratings Section ─── */}
      <SectionDivider label="Approval Ratings" delay={530} />

      <View className="flex-row flex-wrap" style={{ gap: 10 }}>
        <View style={{ width: approvalCardWidth }}>
          <IndicatorCard
            data={presidentApproval.data}
            isLoading={presidentApproval.isLoading}
            isError={presidentApproval.isError}
            onRetry={() => presidentApproval.refetch()}
            icon={'\uD83C\uDFDB\uFE0F'}
            accentColor="#1d4ed8"
            delay={550}
          />
        </View>
        <View style={{ width: approvalCardWidth }}>
          <IndicatorCard
            data={congressApproval.data}
            isLoading={congressApproval.isLoading}
            isError={congressApproval.isError}
            onRetry={() => congressApproval.refetch()}
            icon={'\uD83D\uDED6'}
            accentColor="#7c3aed"
            delay={580}
          />
        </View>
        <View style={{ width: approvalCardWidth }}>
          <IndicatorCard
            data={scotusApproval.data}
            isLoading={scotusApproval.isLoading}
            isError={scotusApproval.isError}
            onRetry={() => scotusApproval.refetch()}
            icon={'\u2696\uFE0F'}
            accentColor="#0284c7"
            delay={610}
          />
        </View>
      </View>
    </View>
  );
}
