import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import type { ListRenderItem } from 'react-native';

import { INITIAL_PAGE } from '@/hooks/useMediaListState';
import type { MediaListState } from '@/hooks/useMediaListState';
import type { RootStackParamList } from '@/navigation/types';
import type { MediaType, PaginatedResponse } from '@/types/common';
import type { Media } from '@/types/media';
import { MediaListItem } from '@/ui/organisms/MediaListItem';
import { getErrorStatus } from '@/utils/rtkQueryError';

// Structurally matches the result shape of all four list/search query
// hooks (getPopularMovies/searchMovies/getPopularTv/searchTv) — every one
// of them declares builder.query<PaginatedResponse<Media>, ...>, so this
// hook can drive whichever pair a screen actually calls without needing to
// know which.
type MediaListQuery = {
  data?: PaginatedResponse<Media>;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => void;
};

type DetailsRoute = 'MovieDetails' | 'TvDetails';

const keyExtractor = (item: Media): string => String(item.id);

type UseMediaListScreenArgs = {
  mediaType: MediaType;
  detailsRoute: DetailsRoute;
  title: string;
  subtitle: string;
  emptyMessage: string;
  state: MediaListState;
  query: MediaListQuery;
};

// Shared by MoviesListScreen/TvListScreen — builds the full ListTemplate
// prop set from the active query result and the shared list state. Only
// which RTK Query hooks get called (movie vs tv endpoints) and which
// details route recommendations navigate to differ between the two
// screens; everything else (pagination/refresh logic, row rendering,
// prop assembly) is identical and lives here once.
export const useMediaListScreen = ({
  mediaType,
  detailsRoute,
  title,
  subtitle,
  emptyMessage,
  state,
  query,
}: UseMediaListScreenArgs) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data, isLoading, isFetching, isError, error, refetch } = query;

  const handleEndReached = useCallback(() => {
    if (data && data.page < data.totalPages) {
      state.setPage(data.page + 1);
    }
  }, [data, state]);

  // setPage(INITIAL_PAGE) alone forces a refetch via forceRefetch's
  // page-changed check (see getPopularMovies/searchMovies in tmdbApi.ts) —
  // but only when page actually changes. If the user pulls to refresh while
  // already on page 1, the state setter would be a no-op and nothing would
  // refetch, so that case calls refetch() directly instead.
  const handleRefresh = useCallback(() => {
    if (state.page === INITIAL_PAGE) {
      refetch();
    } else {
      state.setPage(INITIAL_PAGE);
    }
  }, [state, refetch]);

  const handlePressMedia = useCallback(
    (media: Media) => {
      navigation.navigate(detailsRoute, { id: media.id });
    },
    [navigation, detailsRoute],
  );

  const renderItem: ListRenderItem<Media> = useCallback(
    ({ item }) => <MediaListItem media={item} onPress={handlePressMedia} />,
    [handlePressMedia],
  );

  return {
    data: data?.results,
    keyExtractor,
    renderItem,
    isLoading,
    isFetching,
    isError,
    errorStatus: getErrorStatus(error),
    onRetry: refetch,
    emptyMessage,
    hasNextPage: !!data && data.page < data.totalPages,
    onEndReached: handleEndReached,
    onRefresh: handleRefresh,
    searchValue: state.search,
    onSearchChange: state.handleSearchChange,
    title,
    subtitle,
    mediaType,
    genreId: state.genreId,
    onGenreChange: state.handleGenreChange,
    sortBy: state.sortBy,
    onSortChange: state.handleSortChange,
  };
};
