import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text } from 'react-native';

import { useFavoriteActions } from '@/hooks/useFavoriteActions';
import { useIsFavorite } from '@/hooks/useIsFavorite';
import type { MediaType } from '@/types/common';

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

  const label = isFavorite ? t('favoriteButton.remove') : t('favoriteButton.add');
  const iconClassName = isFavorite ? 'text-lg text-primary' : 'text-lg text-text';
  const icon = isFavorite ? '★' : '☆';

  return (
    <Pressable
      onPress={() => toggleFavorite({ id, mediaType })}
      accessibilityRole="button"
      accessibilityLabel={label}
      className="size-10 items-center justify-center rounded-full bg-black/60"
    >
      <Text className={iconClassName}>{icon}</Text>
    </Pressable>
  );
});
