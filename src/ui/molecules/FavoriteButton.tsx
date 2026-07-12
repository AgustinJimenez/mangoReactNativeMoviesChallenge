import { Ionicons } from '@expo/vector-icons';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { useFavoriteActions } from '@/hooks/useFavoriteActions';
import { useIsFavorite } from '@/hooks/useIsFavorite';
import { colors } from '@/theme/tokens';
import type { MediaType } from '@/types/common';

const BOUNCE_SCALE = 1.3;
const BASE_SCALE = 1;
const ICON_SIZE = 18;

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
      testID="favorite-button"
      className={`size-10 items-center justify-center rounded-full border ${
        isFavorite ? 'border-primary bg-primary/10' : 'border-border bg-transparent'
      }`}
    >
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={isFavorite ? 'star' : 'star-outline'}
          size={ICON_SIZE}
          color={isFavorite ? colors.primary : colors.text}
        />
      </Animated.View>
    </Pressable>
  );
});
