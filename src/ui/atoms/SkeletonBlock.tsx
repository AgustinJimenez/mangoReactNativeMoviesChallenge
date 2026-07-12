import { memo, useEffect } from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const PULSE_MIN_OPACITY = 0.4;
const PULSE_MAX_OPACITY = 1;
const PULSE_DURATION_MS = 700;

type SkeletonBlockProps = {
  className: string;
  style?: ViewStyle;
};

// A single pulsing placeholder rectangle — the building block for
// DetailsSkeleton. No gradient-sweep shimmer (that needs a gradient
// library the app doesn't otherwise depend on); a plain opacity pulse via
// Reanimated (already a dependency) reads as "loading" just as clearly
// without adding one just for this.
//
// The animated opacity lives on the outer Animated.View with no className,
// and the actual size/color/rounding on a plain inner View with className
// — putting both style={animatedStyle} and className on the same element
// has silently dropped className-derived styles elsewhere in this app (see
// FavoriteButton.tsx / docs/planning.md).
export const SkeletonBlock = memo(({ className, style }: SkeletonBlockProps) => {
  const opacity = useSharedValue(PULSE_MAX_OPACITY);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(PULSE_MIN_OPACITY, { duration: PULSE_DURATION_MS }),
        withTiming(PULSE_MAX_OPACITY, { duration: PULSE_DURATION_MS }),
      ),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={animatedStyle}>
      <View className={className} style={style} />
    </Animated.View>
  );
});
