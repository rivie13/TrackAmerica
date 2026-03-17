import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Linking, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Sparkline } from './Sparkline';
import type { IndicatorData } from '@/lib/services/economic';

interface IndicatorCardProps {
  data?: IndicatorData;
  isLoading?: boolean;
  isError?: boolean;
  icon?: string;
  accentColor?: string;
  delay?: number;
  onRetry?: () => void;
}

function formatValue(value: number | string, unit: string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return 'N/A';
  if (unit === 'USD') return `$${(num / 1e12).toFixed(2)}T`;
  if (unit === '$/gal') return `$${num.toFixed(2)}`;
  if (unit === '%') return `${num.toFixed(1)}%`;
  if (unit === 'index') return num.toFixed(1);
  return num.toFixed(2);
}

function formatChange(change: number | string | null): {
  text: string;
  isPositive: boolean;
  isNeutral: boolean;
} {
  if (change === null || change === undefined)
    return { text: 'N/A', isPositive: false, isNeutral: true };
  const num = typeof change === 'string' ? parseFloat(change) : change;
  if (isNaN(num)) return { text: 'N/A', isPositive: false, isNeutral: true };
  const isPositive = num > 0;
  const arrow = isPositive ? '\u2191' : num < 0 ? '\u2193' : '\u2192';
  return {
    text: `${arrow} ${Math.abs(num).toFixed(1)}%`,
    isPositive,
    isNeutral: Math.abs(num) < 0.1,
  };
}

export function IndicatorCard({
  data,
  isLoading,
  isError,
  icon,
  accentColor = '#3b82f6',
  delay = 0,
  onRetry,
}: IndicatorCardProps) {
  const [selectedTrendIndex, setSelectedTrendIndex] = useState(0);
  // Show description by default
  const [showDescription, setShowDescription] = useState(true);
  const [showSources, setShowSources] = useState(false);

  const cardStyle = {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderRadius: 16,
    backgroundColor: 'white',
  };

  if (isLoading) {
    return (
      <Animated.View
        entering={FadeIn.delay(delay).duration(400)}
        className="bg-white rounded-2xl p-3 border border-gray-100"
        style={{ ...cardStyle, minHeight: 180 }}
      >
        <View className="flex-1 items-center justify-center">
          <View
            className="w-8 h-8 rounded-full items-center justify-center mb-2"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <ActivityIndicator size="small" color={accentColor} />
          </View>
          <Text className="text-xs text-gray-400">Loading data...</Text>
        </View>
      </Animated.View>
    );
  }

  if (isError || !data) {
    const errorCard = (
      <Animated.View
        entering={FadeIn.delay(delay).duration(400)}
        className="bg-white rounded-2xl p-3 border border-red-100"
        style={{ ...cardStyle, minHeight: 180 }}
      >
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-400 text-sm">Unable to load</Text>
          {onRetry && <Text className="text-red-300 text-xs mt-1">Tap to retry</Text>}
        </View>
      </Animated.View>
    );
    return onRetry ? <Pressable onPress={onRetry}>{errorCard}</Pressable> : errorCard;
  }

  const selectedTrend = data.trends[selectedTrendIndex];
  const changeInfo = selectedTrend ? formatChange(selectedTrend.change) : null;
  const chartPoints = selectedTrend?.chartPoints;
  const hasPresidentMarkers = !!(data.presidentMarkers && data.presidentMarkers.length > 1);

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(500)} style={cardStyle}>
      <View className="bg-white rounded-2xl p-3 border border-gray-100 overflow-hidden">
        {/* Header */}
        <View className="flex-row items-center mb-1">
          {icon && <Text className="text-sm mr-1">{icon}</Text>}
          <Text
            className="text-xs font-semibold text-gray-400 uppercase tracking-widest flex-1"
            numberOfLines={1}
          >
            {data.label}
          </Text>
          {data.description && (
            <Pressable
              onPress={() => setShowDescription(!showDescription)}
              hitSlop={12}
              className="rounded-full items-center justify-center"
              style={{
                width: 22,
                height: 22,
                backgroundColor: showDescription ? '#fee2e2' : '#f1f5f9',
              }}
            >
              <Text style={{ fontSize: 12, color: showDescription ? '#dc2626' : '#6b7280' }}>
                {showDescription ? '\u2715' : 'i'}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Description (shown by default, collapsible) */}
        {showDescription && data.description && (
          <View className="bg-gray-50 rounded-lg px-2 py-1.5 mb-1.5">
            <Text className="text-xs text-gray-500 leading-4">{data.description}</Text>
          </View>
        )}

        {/* Current Value */}
        <View className="flex-row items-end mb-0.5">
          <Text className="text-xl font-bold mr-1" style={{ color: accentColor }}>
            {formatValue(data.current, data.unit)}
          </Text>
          <Text className="text-[10px] text-gray-400 mb-0.5">now</Text>
        </View>

        {/* Comparison with previous value */}
        {selectedTrend && (
          <View className="flex-row items-center mb-1" style={{ gap: 4 }}>
            {selectedTrend.previous !== null && (
              <Text className="text-xs text-gray-500">
                was {formatValue(selectedTrend.previous, data.unit)}
              </Text>
            )}
            {changeInfo && !changeInfo.isNeutral && (
              <View
                className="rounded-full px-1.5 py-0.5"
                style={{ backgroundColor: changeInfo.isPositive ? '#dcfce7' : '#fee2e2' }}
              >
                <Text
                  className="text-xs font-bold"
                  style={{ color: changeInfo.isPositive ? '#16a34a' : '#dc2626' }}
                >
                  {changeInfo.text}
                </Text>
              </View>
            )}
            <Text className="text-[10px] text-gray-400">
              {selectedTrend.period === 'All' ? 'all time' : `${selectedTrend.period} ago`}
            </Text>
          </View>
        )}

        {/* Chart */}
        <View className="my-1">
          {chartPoints && chartPoints.length >= 2 ? (
            <Sparkline
              points={chartPoints}
              height={hasPresidentMarkers ? 120 : 100}
              color={accentColor}
              unit={data.unit}
              presidentMarkers={data.presidentMarkers}
            />
          ) : (
            <View style={{ height: 100 }} className="items-center justify-center">
              <Text className="text-[10px] text-gray-300">No chart data</Text>
            </View>
          )}
        </View>

        {/* Period selector pills */}
        <View className="flex-row mt-1 flex-wrap" style={{ gap: 4 }}>
          {data.trends.map((trend, i) => (
            <Pressable
              key={trend.period}
              onPress={() => setSelectedTrendIndex(i)}
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: i === selectedTrendIndex ? accentColor : '#f1f5f9' }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: i === selectedTrendIndex ? '#ffffff' : '#64748b' }}
              >
                {trend.period}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Individual poll sources (for presidential approval) */}
        {data.sources && data.sources.length > 0 && (
          <View className="mt-2">
            <Pressable onPress={() => setShowSources(!showSources)}>
              <Text className="text-[9px] font-semibold text-gray-400">
                {showSources ? '\u25BC' : '\u25B6'} Recent polls ({data.sources.length})
              </Text>
            </Pressable>
            {showSources && (
              <ScrollView style={{ maxHeight: 120 }} className="mt-1">
                {data.sources.map((s, i) => (
                  <View key={i} className="flex-row justify-between py-0.5 border-b border-gray-50">
                    <Text className="text-[8px] text-gray-600 flex-1" numberOfLines={1}>
                      {s.pollster}
                    </Text>
                    <Text className="text-[8px] text-gray-400 mx-1">{s.date}</Text>
                    <Text className="text-[8px] font-semibold text-green-600">{s.approve}%</Text>
                    <Text className="text-[8px] text-gray-300 mx-0.5">/</Text>
                    <Text className="text-[8px] font-semibold text-red-500">{s.disapprove}%</Text>
                    {s.sampleSize && (
                      <Text className="text-[7px] text-gray-300 ml-1">{s.sampleSize}</Text>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        )}

        {/* Source link */}
        {data.sourceUrl && (
          <Pressable onPress={() => Linking.openURL(data.sourceUrl!)} className="mt-1.5">
            <Text className="text-[10px] text-blue-400">
              Source: <Text className="underline">{data.sourceName ?? 'Verify source'}</Text>
            </Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
