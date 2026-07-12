import { cssInterop } from 'nativewind';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

// Same reasoning as expo-image/Poster.tsx: Reanimated's Animated.View isn't
// a primitive NativeWind wraps automatically.
cssInterop(Animated.View, { className: 'style' });

const SWEEP_DURATION_MS = 900;
const BAR_WIDTH_PERCENT = 33;
const TRACK_END_PERCENT = 100 - BAR_WIDTH_PERCENT;

// Indeterminate progress bar for background refetches (a stale-but-served
// cache is being revalidated) — a sweeping bar reads as "still working" more
// clearly than a static one, without needing real progress data to drive it.
export const RefreshIndicator = () => {
  const sweep = useSharedValue(0);

  useEffect(() => {
    sweep.value = withRepeat(
      withTiming(TRACK_END_PERCENT, {
        duration: SWEEP_DURATION_MS,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true,
    );
  }, [sweep]);

  const animatedStyle = useAnimatedStyle(() => ({
    left: `${sweep.value}%`,
  }));

  return (
    <View className="h-0.5 overflow-hidden bg-surface" testID="refresh-indicator">
      <Animated.View style={animatedStyle} className="h-full w-1/3 rounded-full bg-primary" />
    </View>
  );
};
