import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, View } from 'react-native';
import type { ListRenderItem } from 'react-native';

import { colors } from '@/theme/tokens';
import type { Genre, MediaDetails } from '@/types/media';
import { Backdrop } from '@/ui/atoms/Backdrop';
import { Badge } from '@/ui/atoms/Badge';
import { Poster } from '@/ui/atoms/Poster';
import { FavoriteButton } from '@/ui/molecules/FavoriteButton';
import { buildPosterTransitionTag } from '@/utils/image';
import { formatRuntime } from '@/utils/runtime';

const STAR_ICON_SIZE = 16;
const CALENDAR_ICON_SIZE = 14;

// Pulls the poster/title block up so the poster overlaps the bottom of the
// backdrop image instead of sitting in a flat gap below it (reference
// mockup used a similar negative-margin overlap). The poster's own height
// (w-32 → 128dp at aspect-[2/3] → 192dp) is taller than the info column's
// content, so only the opaque poster card overlaps the image — the title/
// rating text still lands below the backdrop's bottom edge on the solid
// background, no extra scrim needed there.
const POSTER_OVERLAP = 64;
const posterOverlapStyle = { marginTop: -POSTER_OVERLAP };

const GenreSeparator = () => <View className="w-xs" />;

const renderGenreBadge: ListRenderItem<Genre> = ({ item }) => <Badge label={item.name} />;

type DateAndRuntimeProps = {
  releaseDate: string;
  runtimeMinutes: number | null;
  certification: string | null;
};

// TMDB's release_date/runtime aren't always filled in for every language a
// title has some data in (a movie can have an English synopsis but an
// empty es-ES release_date, or a runtime of 0 for an unreleased/incomplete
// entry) — each piece hides independently instead of rendering an empty
// date or a meaningless "0m", and the whole row disappears if nothing in
// it has real data.
const DateAndRuntime = ({ releaseDate, runtimeMinutes, certification }: DateAndRuntimeProps) => {
  const hasDate = releaseDate.length > 0;
  const hasRuntime = runtimeMinutes != null && runtimeMinutes > 0;

  if (!hasDate && !hasRuntime && certification == null) {
    return null;
  }

  return (
    <View className="flex-row items-center gap-xs">
      {hasDate && (
        <>
          <Ionicons name="calendar-outline" size={CALENDAR_ICON_SIZE} color={colors.textMuted} />
          <Text className="text-sm text-textMuted">{releaseDate}</Text>
        </>
      )}
      {hasRuntime && (
        <Text className="text-sm text-textMuted">
          {hasDate && '• '}
          {formatRuntime(runtimeMinutes)}
        </Text>
      )}
      {certification != null && (
        <View className="rounded border border-textMuted px-xs">
          <Text className="text-xs font-semibold text-textMuted">{certification}</Text>
        </View>
      )}
    </View>
  );
};

type RatingRowProps = {
  voteAverage: number;
  voteCount: number;
};

const RatingRow = ({ voteAverage, voteCount }: RatingRowProps) => {
  const { t } = useTranslation();

  if (voteCount === 0) {
    return <Text className="text-sm text-textMuted">{t('rating.noVotes')}</Text>;
  }

  return (
    <View className="flex-row items-center gap-xs">
      <Ionicons name="star" size={STAR_ICON_SIZE} color={colors.primary} />
      <Text className="text-sm font-bold text-text">{voteAverage.toFixed(1)}</Text>
      <Text className="text-sm text-textMuted">/10</Text>
      <Text className="text-sm text-textMuted">
        {'• '}
        {t('detailsTemplate.votes', { count: voteCount })}
      </Text>
    </View>
  );
};

type MediaDetailsInfoProps = {
  media: MediaDetails;
};

// The column beside the poster — split out (alongside DateAndRuntime and
// RatingRow above) so no single component's JSX nests too deeply.
const MediaDetailsInfo = ({ media }: MediaDetailsInfoProps) => (
  <View className="flex-1 justify-end gap-xs">
    <Text className="text-xl font-bold text-text">{media.title}</Text>
    <DateAndRuntime
      releaseDate={media.releaseDate}
      runtimeMinutes={media.runtimeMinutes}
      certification={media.certification}
    />
    <View className="flex-row items-center justify-between gap-md">
      <RatingRow voteAverage={media.voteAverage} voteCount={media.voteCount} />
      <FavoriteButton id={media.id} mediaType={media.mediaType} />
    </View>
  </View>
);

type MediaDetailsHeaderProps = {
  media: MediaDetails;
};

export const MediaDetailsHeader = ({ media }: MediaDetailsHeaderProps) => {
  return (
    <View>
      <Backdrop path={media.backdropPath} />
      <View className="gap-md px-md" style={posterOverlapStyle}>
        <View className="flex-row gap-md">
          <View className="w-32 overflow-hidden rounded-lg border border-white/30">
            <Poster
              path={media.posterPath}
              title={media.title}
              size="w780"
              sharedTransitionTag={buildPosterTransitionTag(media.mediaType, media.id)}
            />
          </View>
          <MediaDetailsInfo media={media} />
        </View>
        <FlatList
          horizontal
          data={media.genres}
          keyExtractor={(genre) => String(genre.id)}
          renderItem={renderGenreBadge}
          ItemSeparatorComponent={GenreSeparator}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );
};
