import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItem } from 'react-native';

import { useGetPopularTvQuery, useSearchTvQuery } from '@/api/tmdbApi';
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

export const TvListScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const language = useActiveLocale();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(INITIAL_PAGE);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('popularity');
  const debouncedSearch = useDebouncedValue(search);
  const isSearching = debouncedSearch.trim().length > 0;

  const popularQuery = useGetPopularTvQuery(
    { page, language, genreId: genreId ?? undefined, sortBy },
    { skip: isSearching },
  );
  const searchQuery = useSearchTvQuery(
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

  const handlePressMedia = useCallback(
    (media: Media) => {
      navigation.navigate(ROUTES.TV_DETAILS, { id: media.id });
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
      searchValue={search}
      onSearchChange={handleSearchChange}
      title={t('navigation.tvTab')}
      subtitle={t('listHeader.tvSubtitle')}
      mediaType="tv"
      genreId={genreId}
      onGenreChange={handleGenreChange}
      sortBy={sortBy}
      onSortChange={handleSortChange}
    />
  );
};
