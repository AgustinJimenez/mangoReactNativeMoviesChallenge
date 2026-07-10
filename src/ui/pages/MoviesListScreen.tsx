import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGetPopularMoviesQuery, useSearchMoviesQuery } from '@/api/tmdbApi';
import { useActiveLocale } from '@/hooks/useActiveLocale';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ROUTES } from '@/navigation/routes';
import type { RootStackParamList } from '@/navigation/types';
import type { Media } from '@/types/media';
import { MediaListItem } from '@/ui/organisms/MediaListItem';
import { ListTemplate } from '@/ui/templates/ListTemplate';
import { getErrorStatus } from '@/utils/rtkQueryError';

const INITIAL_PAGE = 1;

export const MoviesListScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const language = useActiveLocale();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(INITIAL_PAGE);
  const debouncedSearch = useDebouncedValue(search);
  const isSearching = debouncedSearch.trim().length > 0;

  const popularQuery = useGetPopularMoviesQuery({ page, language }, { skip: isSearching });
  const searchQuery = useSearchMoviesQuery(
    { query: debouncedSearch, page, language },
    { skip: !isSearching },
  );
  const activeQuery = isSearching ? searchQuery : popularQuery;
  const { data, isLoading, isFetching, isError, error, refetch } = activeQuery;

  const handleSearchChange = (text: string) => {
    setSearch(text);
    setPage(INITIAL_PAGE);
  };

  const handleEndReached = () => {
    if (data && data.page < data.totalPages) {
      setPage(data.page + 1);
    }
  };

  const handlePressMedia = (media: Media) => {
    navigation.navigate(ROUTES.MOVIE_DETAILS, { id: media.id });
  };

  return (
    <ListTemplate
      data={data?.results}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <MediaListItem media={item} onPress={handlePressMedia} />}
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
    />
  );
};
