import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import type { Media } from '@/types/media';
import { Poster } from '@/ui/atoms/Poster';
import { RatingBadge } from '@/ui/atoms/RatingBadge';
import { FavoriteButton } from '@/ui/molecules/FavoriteButton';
import { resolveGenreNames } from '@/utils/genres';
import { buildPosterTransitionTag } from '@/utils/image';

type MediaListItemProps = {
  media: Media;
  onPress: (media: Media) => void;
};

// Memoized: this is the FlatList row component for every media list in the
// app. Callers must pass a stable `onPress` (useCallback) for this to pay
// off — see MoviesListScreen/TvListScreen/FavoritesScreen.
export const MediaListItem = memo(({ media, onPress }: MediaListItemProps) => {
  const { t } = useTranslation();
  const genreNames = resolveGenreNames(media.genreIds, media.mediaType, t);

  return (
    <Pressable
      onPress={() => onPress(media)}
      accessibilityRole="button"
      accessibilityLabel={media.title}
      testID="media-list-item"
      className="flex-row items-center gap-sm rounded-2xl border border-border bg-surface p-sm"
    >
      <View className="w-16">
        <Poster
          path={media.posterPath}
          title={media.title}
          size="w342"
          sharedTransitionTag={buildPosterTransitionTag(media.mediaType, media.id)}
        />
      </View>
      <View className="flex-1 gap-xs">
        <Text numberOfLines={2} className="text-sm font-bold text-text">
          {media.title}
        </Text>
        {genreNames.length > 0 && (
          <Text numberOfLines={1} className="text-xs text-textMuted">
            {genreNames.join(' • ')}
          </Text>
        )}
        <RatingBadge voteAverage={media.voteAverage} voteCount={media.voteCount} />
        <Text numberOfLines={2} className="text-xs text-textMuted">
          {media.overview}
        </Text>
      </View>
      <FavoriteButton id={media.id} mediaType={media.mediaType} />
    </Pressable>
  );
});
