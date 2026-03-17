import React, { useState } from 'react';
import { View, ScrollView, Text, Pressable, Linking } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { USAMap, StateSearch, SmallStateButtons } from '@/components';
import { NationalDashboard } from '@/components/dashboard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

function StarIcon({ size = 16, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <View className="flex-1" style={{ backgroundColor: '#1e3a5f' }}>
        <LoadingScreen onFinish={() => setLoading(false)} minDuration={2200} />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
      <ScrollView className="flex-1" scrollEnabled={true} nestedScrollEnabled={true}>
        {/* Hero Header — Navy with red accent stripe */}
        <View style={{ backgroundColor: '#1e3a5f' }}>
          {/* Red stripe at very top */}
          <View style={{ height: 3, backgroundColor: '#c53030' }} />

          <View className="px-6 pt-12 pb-8">
            {/* Stars + Title */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(600)}
              className="flex-row items-center mb-1"
            >
              <StarIcon size={14} color="#ffffff60" />
              <StarIcon size={14} color="#ffffff60" />
              <StarIcon size={14} color="#ffffff60" />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(600)}>
              <Text className="text-3xl font-bold text-white tracking-tight">TrackAmerica</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400).duration(600)}>
              <Text className="text-base mt-1" style={{ color: '#93c5fd' }}>
                How is America doing? See the data for yourself.
              </Text>
            </Animated.View>
          </View>

          {/* Curved bottom edge */}
          <Svg width="100%" height="20" viewBox="0 0 1440 20" preserveAspectRatio="none">
            <Path d="M0,0 L0,0 Q720,40 1440,0 L1440,20 L0,20 Z" fill="#f8fafc" />
          </Svg>
        </View>

        {/* National Dashboard — overlapping the header slightly */}
        <Animated.View entering={FadeInUp.delay(500).duration(700)} className="px-4 -mt-2">
          <NationalDashboard />
        </Animated.View>

        {/* Map Section */}
        <Animated.View entering={FadeInUp.delay(700).duration(600)} className="px-4 mt-6">
          <View
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            style={{
              elevation: 4,
              shadowColor: '#1e3a5f',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
            }}
          >
            {/* Map Section Header */}
            <View
              className="px-5 pt-5 pb-3"
              style={{ borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
            >
              <View className="flex-row items-center mb-1">
                <View
                  className="w-1 h-5 rounded-full mr-2"
                  style={{ backgroundColor: '#c53030' }}
                />
                <Text className="text-lg font-bold text-gray-900">Your Representatives</Text>
              </View>
              <Text className="text-sm text-gray-500 ml-3">
                Click a state to see senators and house members
              </Text>
            </View>

            {/* Search */}
            <View className="px-4 pt-3 z-50">
              <StateSearch />
            </View>

            {/* Small State Buttons */}
            <View className="px-2 mt-3">
              <SmallStateButtons />
            </View>

            {/* Map */}
            <View className="w-full mt-2 z-10">
              <USAMap width="100%" height={500} />
            </View>
          </View>
        </Animated.View>

        {/* Footer */}
        <Animated.View entering={FadeInUp.delay(900).duration(600)} className="px-4 mt-6 mb-8">
          <View
            className="rounded-2xl p-5 items-center"
            style={{
              backgroundColor: '#1e3a5f',
              elevation: 2,
              shadowColor: '#1e3a5f',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
            }}
          >
            {/* Decorative stars */}
            <View className="flex-row mb-3">
              <StarIcon size={10} color="#ffffff30" />
              <View className="mx-1">
                <StarIcon size={10} color="#ffffff30" />
              </View>
              <StarIcon size={10} color="#ffffff30" />
            </View>

            <Text className="text-xs text-blue-200 mb-1 text-center">
              All data sourced from official U.S. government APIs
            </Text>
            <Text className="text-[10px] text-blue-300/60 mb-4 text-center">
              Congress.gov {'\u00B7'} EIA {'\u00B7'} FRED {'\u00B7'} U.S. Treasury
            </Text>

            <Pressable
              onPress={() => Linking.openURL('https://buymeacoffee.com')}
              className="rounded-full px-5 py-2.5 flex-row items-center"
              style={{ backgroundColor: '#FFDD00' }}
            >
              <Text className="text-sm font-bold text-gray-900">{'\u2615'} Buy Me a Coffee</Text>
            </Pressable>

            {/* Bottom stripe accent */}
            <View className="flex-row mt-4">
              <View style={{ width: 30, height: 2, backgroundColor: '#c53030', borderRadius: 1 }} />
              <View
                style={{
                  width: 30,
                  height: 2,
                  backgroundColor: '#ffffff',
                  borderRadius: 1,
                  marginHorizontal: 4,
                }}
              />
              <View style={{ width: 30, height: 2, backgroundColor: '#3b82f6', borderRadius: 1 }} />
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
