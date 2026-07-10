import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import type { ListRenderItem } from 'react-native';

import { EmptyState } from '@/ui/molecules/EmptyState';
import { ErrorState } from '@/ui/molecules/ErrorState';
import { LoadingState } from '@/ui/molecules/LoadingState';
import { SearchBar } from '@/ui/molecules/SearchBar';

const END_REACHED_THRESHOLD = 0.5;

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
  hasNextPage: boolean;
  onEndReached: () => void;
  searchValue?: string;
  onSearchChange?: (text: string) => void;
};

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
  hasNextPage,
  onEndReached,
  searchValue,
  onSearchChange,
}: ListTemplateProps<T>) => {
  const { t } = useTranslation();
  const hasData = !!data && data.length > 0;

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError && !hasData) {
    return <ErrorState status={errorStatus} onRetry={onRetry} />;
  }

  const listFooter = isFetching && hasNextPage ? <ActivityIndicator className="py-md" /> : null;
  const body = !hasData ? (
    <EmptyState message={emptyMessage} />
  ) : (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onEndReached={hasNextPage ? onEndReached : undefined}
      onEndReachedThreshold={END_REACHED_THRESHOLD}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews
      ListFooterComponent={listFooter}
    />
  );

  return (
    <View className="flex-1 bg-background">
      {onSearchChange && (
        <View className="p-md">
          <SearchBar value={searchValue ?? ''} onChangeText={onSearchChange} />
        </View>
      )}
      {isFetching && hasData && <View className="h-0.5 bg-primary" />}
      {isError && hasData && (
        <Text className="bg-danger/20 px-md py-xs text-center text-xs text-text">
          {t('listTemplate.staleDataNotice')}
        </Text>
      )}
      {body}
    </View>
  );
};
