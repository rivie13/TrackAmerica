import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

interface LoadingScreenProps {
  onFinish?: () => void;
  minDuration?: number;
}

function StarIcon({ size = 20, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

export function LoadingScreen({ onFinish, minDuration = 2000 }: LoadingScreenProps) {
  const [show, setShow] = useState(true);
  const pulse = useSharedValue(0.6);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    const timer = setTimeout(() => {
      setShow(false);
      onFinish?.();
    }, minDuration);
    return () => clearTimeout(timer);
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  if (!show) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(500)}
      className="absolute inset-0 z-50 items-center justify-center"
      style={{ backgroundColor: '#1e3a5f' }}
    >
      {/* Decorative stripes at top */}
      <View className="absolute top-0 left-0 right-0">
        <View style={{ height: 4, backgroundColor: '#c53030' }} />
        <View style={{ height: 4, backgroundColor: '#ffffff' }} />
        <View style={{ height: 4, backgroundColor: '#c53030' }} />
      </View>

      {/* Stars */}
      <Animated.View style={pulseStyle} className="flex-row mb-4">
        <View className="mx-1">
          <StarIcon size={14} color="#ffffff50" />
        </View>
        <View className="mx-1">
          <StarIcon size={18} color="#ffffff80" />
        </View>
        <View className="mx-1">
          <StarIcon size={22} color="#ffffffcc" />
        </View>
        <View className="mx-1">
          <StarIcon size={18} color="#ffffff80" />
        </View>
        <View className="mx-1">
          <StarIcon size={14} color="#ffffff50" />
        </View>
      </Animated.View>

      {/* Title */}
      <Text className="text-4xl font-bold text-white tracking-tight mb-2">TrackAmerica</Text>
      <Text className="text-base text-blue-200 mb-8">Your non-biased national dashboard</Text>

      {/* Loading bar */}
      <View className="w-48 h-1 bg-white/20 rounded-full overflow-hidden">
        <Animated.View
          style={[
            { width: '60%', height: '100%', backgroundColor: '#c53030', borderRadius: 4 },
            pulseStyle,
          ]}
        />
      </View>

      {/* Bottom stripes */}
      <View className="absolute bottom-0 left-0 right-0">
        <View style={{ height: 4, backgroundColor: '#c53030' }} />
        <View style={{ height: 4, backgroundColor: '#ffffff' }} />
        <View style={{ height: 4, backgroundColor: '#c53030' }} />
      </View>
    </Animated.View>
  );
}
