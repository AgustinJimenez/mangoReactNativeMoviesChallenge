import { cssInterop } from 'nativewind';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { useFavoriteActions } from '@/hooks/useFavoriteActions';
import { useIsFavorite } from '@/hooks/useIsFavorite';
import type { MediaType } from '@/types/common';

// Same reasoning as expo-image/Poster.tsx: Reanimated's Animated.View isn't
// one of the primitives NativeWind wraps automatically.
cssInterop(Animated.View, { className: 'style' });

const BOUNCE_SCALE = 1.3;
const BASE_SCALE = 1;

type FavoriteButtonProps = {
  id: number;
  mediaType: MediaType;
};

// Memoized: rendered once per row in list FlatLists. Its own re-renders are
// already scoped to this id (useIsFavorite's granular selector), but without
// memo it would still re-render whenever its parent row does.
export const FavoriteButton = memo(({ id, mediaType }: FavoriteButtonProps) => {
  const { t } = useTranslation();
  const isFavorite = useIsFavorite(id, mediaType);
  const { toggleFavorite } = useFavoriteActions();
  const scale = useSharedValue(BASE_SCALE);

  const label = isFavorite ? t('favoriteButton.remove') : t('favoriteButton.add');
  const iconClassName = isFavorite ? 'text-lg text-primary' : 'text-lg text-text';
  const icon = isFavorite ? '★' : '☆';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(withSpring(BOUNCE_SCALE), withSpring(BASE_SCALE));
    toggleFavorite({ id, mediaType });
  }, [id, mediaType, scale, toggleFavorite]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="size-10 items-center justify-center rounded-full bg-black/60"
    >
      <Animated.View style={animatedStyle}>
        <Text className={iconClassName}>{icon}</Text>
      </Animated.View>
    </Pressable>
  );
});
