import { cssInterop } from 'nativewind';
import { useTranslation } from 'react-i18next';
import { RefreshControl, Text, View } from 'react-native';
import Animated, { useAnimatedScrollHandler } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

import { colors } from '@/theme/tokens';
import type { Media, MediaDetails } from '@/types/media';
import { RefreshIndicator } from '@/ui/atoms/RefreshIndicator';
import { DetailsHeaderBackground } from '@/ui/molecules/DetailsHeaderBackground';
import { ErrorState } from '@/ui/molecules/ErrorState';
import { OverviewSection } from '@/ui/molecules/OverviewSection';
import { TrailerSection } from '@/ui/molecules/TrailerSection';
import { CastList } from '@/ui/organisms/CastList';
import { DetailsSkeleton } from '@/ui/organisms/DetailsSkeleton';
import { MediaDetailsHeader } from '@/ui/organisms/MediaDetailsHeader';
import { RecommendationsList } from '@/ui/organisms/RecommendationsList';

// Same reasoning as expo-image/Poster.tsx: Reanimated's Animated.ScrollView
// isn't a primitive NativeWind wraps automatically.
cssInterop(Animated.ScrollView, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

type DetailsTemplateProps = {
  media: MediaDetails | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorStatus?: number;
  onRetry: () => void;
  onPressRecommendation: (media: Media) => void;
  // Drives DetailsHeaderBackground's scroll-tinted overlay below (created
  // in useMediaDetailsScreen.ts) — updated here on the UI thread via
  // useAnimatedScrollHandler, so the tint tracks scroll position without
  // any React re-renders.
  scrollY: SharedValue<number>;
  headerHeight: number;
};

export const DetailsTemplate = ({
  media,
  isLoading,
  isFetching,
  isError,
  errorStatus,
  onRetry,
  onPressRecommendation,
  scrollY,
  headerHeight,
}: DetailsTemplateProps) => {
  const { t } = useTranslation();
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  if (isLoading) {
    return <DetailsSkeleton />;
  }

  // Only blocks with a full-page ErrorState when there's truly nothing
  // cached to show — a background refetch failing while stale data is
  // already on screen (see refetchOnMountOrArgChange in tmdbApi.ts) just
  // handled below instead, same pattern as ListTemplate.
  if (!media) {
    return <ErrorState status={errorStatus} onRetry={onRetry} />;
  }

  // RefreshIndicator/stale-notice go below MediaDetailsHeader, not above —
  // Backdrop needs to stay flush at the very top of the ScrollView so the
  // transparent nav header keeps floating directly over the image (see
  // screenOptions.tsx); putting anything above it would push it down and
  // reintroduce the dead-space gap that design was built to remove.
  //
  // refreshControl reuses onRetry directly rather than taking a separate
  // onRefresh prop the way ListBody does — ListBody's two props exist
  // because pull-to-refresh there also resets pagination, but there's no
  // pagination on a details screen, so retrying and refreshing are the
  // same refetch() call. Without this, hitting the stale-data notice below
  // left no way to recover except backing out and waiting for
  // refetchOnMountOrArgChange's 5-minute staleness window.
  return (
    <View className="flex-1">
      <Animated.ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="gap-lg pb-xl"
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={onRetry}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <MediaDetailsHeader media={media} />
        {isFetching && <RefreshIndicator />}
        {isError && (
          <Text className="bg-danger/20 px-md py-xs text-center text-xs text-text">
            {t('common.staleDataNotice')}
          </Text>
        )}
        <OverviewSection overview={media.overview} />
        <CastList cast={media.cast} />
        <TrailerSection trailerKey={media.trailerKey} />
        <RecommendationsList
          recommendations={media.recommendations}
          onPressMedia={onPressRecommendation}
        />
      </Animated.ScrollView>
      <DetailsHeaderBackground scrollY={scrollY} headerHeight={headerHeight} />
    </View>
  );
};
