import { useTranslation } from 'react-i18next';

import { useGetPopularTvQuery, useSearchTvQuery } from '@/api';
import { useActiveLocale } from '@/hooks/useActiveLocale';
import { useMediaListScreen } from '@/hooks/useMediaListScreen';
import { useMediaListState } from '@/hooks/useMediaListState';
import { ROUTES } from '@/navigation/routes';
import { ListTemplate } from '@/ui/templates/ListTemplate';

export const TvListScreen = () => {
  const { t } = useTranslation();
  const language = useActiveLocale();
  const state = useMediaListState();

  const popularQuery = useGetPopularTvQuery(
    { page: state.page, language, genreId: state.genreId ?? undefined, sortBy: state.sortBy },
    { skip: state.isSearching },
  );
  const searchQuery = useSearchTvQuery(
    { query: state.debouncedSearch, page: state.page, language },
    { skip: !state.isSearching },
  );

  const listTemplateProps = useMediaListScreen({
    mediaType: 'tv',
    detailsRoute: ROUTES.TV_DETAILS,
    title: t('navigation.tvTab'),
    subtitle: t('listHeader.tvSubtitle'),
    emptyMessage: state.isSearching ? t('mediaList.emptySearch') : t('mediaList.emptyDefault'),
    state,
    query: state.isSearching ? searchQuery : popularQuery,
  });

  return <ListTemplate {...listTemplateProps} />;
};
