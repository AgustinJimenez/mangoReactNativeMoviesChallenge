import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';
import type { ListRenderItem } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { RefreshIndicator } from '@/ui/atoms/RefreshIndicator';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ErrorState } from '@/ui/molecules/ErrorState';
import { LoadingState } from '@/ui/molecules/LoadingState';
import { SearchBar } from '@/ui/molecules/SearchBar';

const END_REACHED_THRESHOLD = 0.5;
// Caps the stagger delay so items appended deep into a paginated list (well
// past what's ever visible mid-animation) don't wait increasingly long —
// only the first screenful benefits from a staggered entrance anyway.
const MAX_STAGGERED_INDEX = 8;
const STAGGER_DELAY_MS = 30;

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
  hasNextPage = false,
  onEndReached,
  searchValue,
  onSearchChange,
}: ListTemplateProps<T>) => {
  const { t } = useTranslation();
  const hasData = !!data && data.length > 0;

  const renderAnimatedItem: ListRenderItem<T> = useCallback(
    (info) => (
      <Animated.View
        entering={FadeInDown.delay(Math.min(info.index, MAX_STAGGERED_INDEX) * STAGGER_DELAY_MS)}
      >
        {renderItem(info)}
      </Animated.View>
    ),
    [renderItem],
  );

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
    <Animated.FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderAnimatedItem}
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
      {isFetching && hasData && <RefreshIndicator />}
      {isError && hasData && (
        <Text className="bg-danger/20 px-md py-xs text-center text-xs text-text">
          {t('listTemplate.staleDataNotice')}
        </Text>
      )}
      {body}
    </View>
  );
};
