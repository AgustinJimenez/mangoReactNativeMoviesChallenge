import { useTranslation } from 'react-i18next';
import { ScrollView, Text } from 'react-native';

import type { Media, MediaDetails } from '@/types/media';
import { RefreshIndicator } from '@/ui/atoms/RefreshIndicator';
import { ErrorState } from '@/ui/molecules/ErrorState';
import { OverviewSection } from '@/ui/molecules/OverviewSection';
import { TrailerSection } from '@/ui/molecules/TrailerSection';
import { CastList } from '@/ui/organisms/CastList';
import { DetailsSkeleton } from '@/ui/organisms/DetailsSkeleton';
import { MediaDetailsHeader } from '@/ui/organisms/MediaDetailsHeader';
import { RecommendationsList } from '@/ui/organisms/RecommendationsList';

type DetailsTemplateProps = {
  media: MediaDetails | undefined;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  errorStatus?: number;
  onRetry: () => void;
  onPressRecommendation: (media: Media) => void;
};

export const DetailsTemplate = ({
  media,
  isLoading,
  isFetching,
  isError,
  errorStatus,
  onRetry,
  onPressRecommendation,
}: DetailsTemplateProps) => {
  const { t } = useTranslation();

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
  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-lg pb-lg">
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
    </ScrollView>
  );
};
