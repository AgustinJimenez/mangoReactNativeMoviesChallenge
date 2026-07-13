import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';
import type { ListRenderItem } from 'react-native';

import type { SortBy } from '@/api';
import type { MediaType } from '@/types/common';
import { RefreshIndicator } from '@/ui/atoms/RefreshIndicator';
import { ListHeader } from '@/ui/molecules/ListHeader';
import { SearchAndFilters } from '@/ui/molecules/SearchAndFilters';
import { ListBody } from '@/ui/organisms/ListBody';

type ListTemplateProps<T> = {
  data: T[] | undefined;
  keyExtractor: (item: T) => string;
  renderItem: ListRenderItem<T>;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorStatus?: number;
  onRetry: () => void;
  emptyMessage: string;
  hasNextPage?: boolean;
  onEndReached?: () => void;
  onRefresh?: () => void;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
  title?: string;
  subtitle?: string;
  // Genre filter + sort only apply to the /discover-backed popular list —
  // TMDB's search endpoint doesn't accept with_genres/sort_by (see
  // api/index.ts), so these are hidden below whenever a search is active,
  // and are simply omitted by callers (FavoritesScreen) that don't have
  // them at all.
  mediaType?: MediaType;
  genreId?: number | null;
  onGenreChange?: (genreId: number | null) => void;
  sortBy?: SortBy;
  onSortChange?: (sortBy: SortBy) => void;
};

// react-doctor flags isLoading/isFetching/isError/onRefresh as a
// hard-to-test boolean-prop combination — same reasoning as ListBody's
// suppression just above it in the tree: these are RTK Query's own status
// flags forwarded as-is, not independent toggles, and each state is
// already covered by the list screens' own tests.
// react-doctor-disable-next-line react-doctor/no-many-boolean-props
export const ListTemplate = <T,>({
  data,
  keyExtractor,
  renderItem,
  isLoading,
  isFetching,
  isError,
  errorStatus,
  onRetry,
  emptyMessage,
  hasNextPage = false,
  onEndReached,
  onRefresh,
  searchValue,
  onSearchChange,
  title,
  subtitle,
  mediaType,
  genreId,
  onGenreChange,
  sortBy,
  onSortChange,
}: ListTemplateProps<T>) => {
  const { t } = useTranslation();
  const hasData = !!data && data.length > 0;
  const isSearching = !!searchValue?.trim();
  const filters =
    !isSearching && mediaType && onGenreChange && sortBy && onSortChange
      ? { mediaType, genreId: genreId ?? null, onGenreChange, sortBy, onSortChange }
      : undefined;

  return (
    <View className="flex-1 bg-background">
      {title && <ListHeader title={title} subtitle={subtitle} />}
      {onSearchChange && (
        <SearchAndFilters
          searchValue={searchValue ?? ''}
          onSearchChange={onSearchChange}
          filters={filters}
        />
      )}
      {isFetching && hasData && <RefreshIndicator />}
      {isError && hasData && (
        <Text className="bg-danger/20 px-md py-xs text-center text-xs text-text">
          {t('common.staleDataNotice')}
        </Text>
      )}
      <View className="flex-1">
        <ListBody
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          isLoading={isLoading}
          isFetching={isFetching}
          isError={isError}
          errorStatus={errorStatus}
          onRetry={onRetry}
          emptyMessage={emptyMessage}
          hasNextPage={hasNextPage}
          onEndReached={onEndReached}
          onRefresh={onRefresh}
        />
      </View>
    </View>
  );
};
