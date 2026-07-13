import { memo } from 'react';

import { useGetMovieDetailsQuery, useGetTvDetailsQuery } from '@/api';
import { useActiveLocale } from '@/hooks/useActiveLocale';
import type { FavoriteEntry } from '@/store/favoritesSlice';
import type { Media } from '@/types/media';
import { MediaListItem } from '@/ui/organisms/MediaListItem';

type FavoriteEntryItemProps = {
  entry: FavoriteEntry;
  onPress: (media: Media) => void;
};

// Favorites only persist { id, mediaType } — the full Media needed to render
// a row is re-fetched (and cached) per entry here, rather than duplicating
// TMDB response data into favoritesSlice. Entries that fail to resolve
// (e.g. deleted from TMDB) are silently dropped instead of showing an error
// row, since the failure is per-item and the rest of the list is still
// useful.
//
// Memoized: FavoritesScreen's FlatList row. `entry` keeps a stable reference
// across renders for unrelated rows (Redux only creates a new object for
// entries that actually changed), so this pays off the same way
// MediaListItem's memo does.
export const FavoriteEntryItem = memo(({ entry, onPress }: FavoriteEntryItemProps) => {
  const language = useActiveLocale();
  const isMovie = entry.mediaType === 'movie';
  const movieQuery = useGetMovieDetailsQuery({ id: entry.id, language }, { skip: !isMovie });
  const tvQuery = useGetTvDetailsQuery({ id: entry.id, language }, { skip: isMovie });
  const media = isMovie ? movieQuery.data : tvQuery.data;

  if (!media) {
    return null;
  }

  return <MediaListItem media={media} onPress={onPress} />;
});
