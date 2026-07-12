import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItem } from 'react-native';

import { useGetPopularMoviesQuery, useSearchMoviesQuery } from '@/api/tmdbApi';
import type { SortBy } from '@/api/tmdbApi';
import { useActiveLocale } from '@/hooks/useActiveLocale';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ROUTES } from '@/navigation/routes';
import type { RootStackParamList } from '@/navigation/types';
import type { Media } from '@/types/media';
import { MediaListItem } from '@/ui/organisms/MediaListItem';
import { ListTemplate } from '@/ui/templates/ListTemplate';
import { getErrorStatus } from '@/utils/rtkQueryError';

const INITIAL_PAGE = 1;

const keyExtractor = (item: Media): string => String(item.id);

export const MoviesListScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const language = useActiveLocale();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(INITIAL_PAGE);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('popularity');
  const debouncedSearch = useDebouncedValue(search);
  const isSearching = debouncedSearch.trim().length > 0;

  const popularQuery = useGetPopularMoviesQuery(
    { page, language, genreId: genreId ?? undefined, sortBy },
    { skip: isSearching },
  );
  const searchQuery = useSearchMoviesQuery(
    { query: debouncedSearch, page, language },
    { skip: !isSearching },
  );
  const activeQuery = isSearching ? searchQuery : popularQuery;
  const { data, isLoading, isFetching, isError, error, refetch } = activeQuery;

  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    setPage(INITIAL_PAGE);
  }, []);

  const handleGenreChange = useCallback((nextGenreId: number | null) => {
    setGenreId(nextGenreId);
    setPage(INITIAL_PAGE);
  }, []);

  const handleSortChange = useCallback((nextSortBy: SortBy) => {
    setSortBy(nextSortBy);
    setPage(INITIAL_PAGE);
  }, []);

  const handleEndReached = useCallback(() => {
    if (data && data.page < data.totalPages) {
      setPage(data.page + 1);
    }
  }, [data]);

  // setPage(INITIAL_PAGE) alone forces a refetch via forceRefetch's
  // page-changed check (see getPopularMovies/searchMovies in tmdbApi.ts) —
  // but only when page actually changes. If the user pulls to refresh while
  // already on page 1, the state setter would be a no-op and nothing would
  // refetch, so that case calls refetch() directly instead.
  const handleRefresh = useCallback(() => {
    if (page === INITIAL_PAGE) {
      refetch();
    } else {
      setPage(INITIAL_PAGE);
    }
  }, [page, refetch]);

  const handlePressMedia = useCallback(
    (media: Media) => {
      navigation.navigate(ROUTES.MOVIE_DETAILS, { id: media.id });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<Media> = useCallback(
    ({ item }) => <MediaListItem media={item} onPress={handlePressMedia} />,
    [handlePressMedia],
  );

  return (
    <ListTemplate
      data={data?.results}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      errorStatus={getErrorStatus(error)}
      onRetry={refetch}
      emptyMessage={isSearching ? t('mediaList.emptySearch') : t('mediaList.emptyDefault')}
      hasNextPage={!!data && data.page < data.totalPages}
      onEndReached={handleEndReached}
      onRefresh={handleRefresh}
      searchValue={search}
      onSearchChange={handleSearchChange}
      title={t('navigation.moviesTab')}
      subtitle={t('listHeader.moviesSubtitle')}
      mediaType="movie"
      genreId={genreId}
      onGenreChange={handleGenreChange}
      sortBy={sortBy}
      onSortChange={handleSortChange}
    />
  );
};
