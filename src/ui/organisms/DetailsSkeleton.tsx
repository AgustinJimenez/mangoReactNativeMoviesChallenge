import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { spacing } from '@/theme/tokens';
import { SkeletonBlock } from '@/ui/atoms/SkeletonBlock';

// Mirrors MediaDetailsHeader's real measurements (Backdrop.tsx,
// MediaDetailsHeader.tsx) so the real content doesn't visibly jump into
// place once it replaces this skeleton.
const BACKDROP_HEIGHT = 220;
const backdropStyle = { height: BACKDROP_HEIGHT };
const POSTER_OVERLAP = 64;
const posterOverlapStyle = { marginTop: -POSTER_OVERLAP };

const SkeletonBackdropAndPoster = () => (
  <View>
    <SkeletonBlock className="bg-surface" style={backdropStyle} />
    <View className="px-md" style={posterOverlapStyle}>
      <View className="flex-row items-end gap-md">
        <SkeletonBlock className="aspect-[2/3] w-32 rounded-lg bg-surface" />
        <View className="flex-1 gap-sm pb-xs">
          <SkeletonBlock className="h-5 w-3/4 rounded bg-surface" />
          <SkeletonBlock className="h-3 w-1/2 rounded bg-surface" />
          <SkeletonBlock className="h-3 w-1/3 rounded bg-surface" />
        </View>
      </View>
    </View>
  </View>
);

const GENRE_CHIP_WIDTHS = ['w-16', 'w-20', 'w-14'];

const SkeletonGenres = () => (
  <View className="flex-row gap-xs px-md">
    {GENRE_CHIP_WIDTHS.map((width) => (
      <SkeletonBlock key={width} className={`h-6 ${width} rounded-full bg-surface`} />
    ))}
  </View>
);

const SkeletonOverview = () => (
  <View className="gap-xs px-md">
    <SkeletonBlock className="h-4 w-24 rounded bg-surface" />
    <SkeletonBlock className="h-3 w-full rounded bg-surface" />
    <SkeletonBlock className="h-3 w-full rounded bg-surface" />
    <SkeletonBlock className="h-3 w-2/3 rounded bg-surface" />
  </View>
);

const CAST_PLACEHOLDER_COUNT = 5;
const CAST_AVATAR_SIZE = 64;
const castAvatarStyle = {
  width: CAST_AVATAR_SIZE,
  height: CAST_AVATAR_SIZE,
  borderRadius: CAST_AVATAR_SIZE / 2,
};
const castContentContainerStyle = { paddingHorizontal: spacing.md, gap: spacing.md };

const SkeletonCastRow = () => (
  <View className="gap-sm">
    <SkeletonBlock className="ml-md h-4 w-16 rounded bg-surface" />
    <View className="flex-row" style={castContentContainerStyle}>
      {Array.from({ length: CAST_PLACEHOLDER_COUNT }, (_, index) => (
        <View key={index} className="w-20 items-center gap-xs">
          <SkeletonBlock className="bg-surface" style={castAvatarStyle} />
          <SkeletonBlock className="h-3 w-16 rounded bg-surface" />
        </View>
      ))}
    </View>
  </View>
);

const TRAILER_THUMBNAIL_WIDTH = 160;
const VIDEO_ASPECT_WIDTH = 16;
const VIDEO_ASPECT_HEIGHT = 9;
const trailerThumbnailStyle = {
  width: TRAILER_THUMBNAIL_WIDTH,
  aspectRatio: VIDEO_ASPECT_WIDTH / VIDEO_ASPECT_HEIGHT,
};

const SkeletonTrailer = () => (
  <View className="gap-sm px-md">
    <SkeletonBlock className="h-4 w-20 rounded bg-surface" />
    <View className="flex-row items-center gap-md">
      <SkeletonBlock className="rounded-lg bg-surface" style={trailerThumbnailStyle} />
      <View className="flex-1 gap-xs">
        <SkeletonBlock className="h-3 w-2/3 rounded bg-surface" />
        <SkeletonBlock className="h-3 w-1/3 rounded bg-surface" />
      </View>
    </View>
  </View>
);

const RECOMMENDATION_PLACEHOLDER_COUNT = 4;
const RECOMMENDATION_CARD_WIDTH = 112;
const recommendationCardStyle = { width: RECOMMENDATION_CARD_WIDTH };
const recommendationsContentContainerStyle = { paddingHorizontal: spacing.md, gap: spacing.sm };

const SkeletonRecommendations = () => (
  <View className="gap-sm">
    <SkeletonBlock className="ml-md h-4 w-32 rounded bg-surface" />
    <View className="flex-row" style={recommendationsContentContainerStyle}>
      {Array.from({ length: RECOMMENDATION_PLACEHOLDER_COUNT }, (_, index) => (
        <View key={index} className="gap-xs" style={recommendationCardStyle}>
          <SkeletonBlock className="aspect-[2/3] rounded-lg bg-surface" />
          <SkeletonBlock className="h-3 w-full rounded bg-surface" />
        </View>
      ))}
    </View>
  </View>
);

// Loading placeholder for the details screen, shaped like the real
// DetailsTemplate layout instead of a centered spinner — most noticeable
// when pushing a new details screen from a recommendation card, where the
// previous screen's content would otherwise flash to blank + spinner for
// the moment before the query resolves.
export const DetailsSkeleton = () => {
  const { t } = useTranslation();

  return (
    <View
      className="flex-1 gap-lg bg-background pb-lg"
      accessibilityRole="progressbar"
      accessibilityLabel={t('loadingState.message')}
    >
      <SkeletonBackdropAndPoster />
      <SkeletonGenres />
      <SkeletonOverview />
      <SkeletonCastRow />
      <SkeletonTrailer />
      <SkeletonRecommendations />
    </View>
  );
};
