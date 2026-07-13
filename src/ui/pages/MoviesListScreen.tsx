import { useTranslation } from 'react-i18next';

import { useGetPopularMoviesQuery, useSearchMoviesQuery } from '@/api';
import { useActiveLocale } from '@/hooks/useActiveLocale';
import { useMediaListScreen } from '@/hooks/useMediaListScreen';
import { useMediaListState } from '@/hooks/useMediaListState';
import { ROUTES } from '@/navigation/routes';
import { ListTemplate } from '@/ui/templates/ListTemplate';

export const MoviesListScreen = () => {
  const { t } = useTranslation();
  const language = useActiveLocale();
  const state = useMediaListState();

  const popularQuery = useGetPopularMoviesQuery(
    { page: state.page, language, genreId: state.genreId ?? undefined, sortBy: state.sortBy },
    { skip: state.isSearching },
  );
  const searchQuery = useSearchMoviesQuery(
    { query: state.debouncedSearch, page: state.page, language },
    { skip: !state.isSearching },
  );

  const listTemplateProps = useMediaListScreen({
    mediaType: 'movie',
    detailsRoute: ROUTES.MOVIE_DETAILS,
    title: t('navigation.moviesTab'),
    subtitle: t('listHeader.moviesSubtitle'),
    emptyMessage: state.isSearching ? t('mediaList.emptySearch') : t('mediaList.emptyDefault'),
    state,
    query: state.isSearching ? searchQuery : popularQuery,
  });

  return <ListTemplate {...listTemplateProps} />;
};
