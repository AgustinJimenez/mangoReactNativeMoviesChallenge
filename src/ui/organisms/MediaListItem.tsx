import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';

import type { Media } from '@/types/media';
import { Poster } from '@/ui/atoms/Poster';
import { RatingBadge } from '@/ui/atoms/RatingBadge';
import { FavoriteButton } from '@/ui/molecules/FavoriteButton';
import { buildPosterTransitionTag } from '@/utils/image';

type MediaListItemProps = {
  media: Media;
  onPress: (media: Media) => void;
};

// Memoized: this is the FlatList row component for every media list in the
// app. Callers must pass a stable `onPress` (useCallback) for this to pay
// off — see MoviesListScreen/TvListScreen/FavoritesScreen.
export const MediaListItem = memo(({ media, onPress }: MediaListItemProps) => {
  return (
    <Pressable
      onPress={() => onPress(media)}
      accessibilityRole="button"
      accessibilityLabel={media.title}
      className="flex-row items-center gap-md p-sm"
    >
      <View className="w-20">
        <Poster
          path={media.posterPath}
          title={media.title}
          size="w342"
          sharedTransitionTag={buildPosterTransitionTag(media.mediaType, media.id)}
        />
      </View>
      <View className="flex-1 gap-xs">
        <Text numberOfLines={2} className="text-base font-semibold text-text">
          {media.title}
        </Text>
        <RatingBadge voteAverage={media.voteAverage} voteCount={media.voteCount} />
      </View>
      <FavoriteButton id={media.id} mediaType={media.mediaType} />
    </Pressable>
  );
});
