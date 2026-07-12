import { useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import type { ListRenderItem } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { spacing } from '@/theme/tokens';
import { EmptyState } from '@/ui/molecules/EmptyState';
import { ErrorState } from '@/ui/molecules/ErrorState';
import { LoadingState } from '@/ui/molecules/LoadingState';

const END_REACHED_THRESHOLD = 0.5;
// Caps the stagger delay so items appended deep into a paginated list (well
// past what's ever visible mid-animation) don't wait increasingly long —
// only the first screenful benefits from a staggered entrance anyway.
const MAX_STAGGERED_INDEX = 8;
const STAGGER_DELAY_MS = 30;

// Module-scope so FlatList sees a stable object reference across renders.
// NativeWind doesn't intercept FlatList's contentContainerStyle, hence
// plain theme tokens rather than className — gives the cards breathing
// room from the screen edges and from each other (see MediaListItem's
// card styling).
const listContentContainerStyle = {
  padding: spacing.md,
  gap: spacing.sm,
};

type ListBodyProps<T> = {
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
  onEndReached?: () => void;
};

// The "main content" area below ListTemplate's header/search/filters —
// switches between loading/error/empty states and the actual results
// FlatList based on query state, shared by every list screen in the app.
export const ListBody = <T,>({
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
}: ListBodyProps<T>) => {
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

  if (!hasData) {
    return <EmptyState message={emptyMessage} />;
  }

  const listFooter = isFetching && hasNextPage ? <ActivityIndicator className="py-md" /> : null;

  return (
    <Animated.FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderAnimatedItem}
      onEndReached={hasNextPage ? onEndReached : undefined}
      onEndReachedThreshold={END_REACHED_THRESHOLD}
      keyboardShouldPersistTaps="handled"
      removeClippedSubviews
      ListFooterComponent={listFooter}
      contentContainerStyle={listContentContainerStyle}
    />
  );
};
