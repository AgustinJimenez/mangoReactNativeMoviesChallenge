import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Text, View } from 'react-native';
import type { ListRenderItem } from 'react-native';

import { colors, spacing } from '@/theme/tokens';
import type { Media } from '@/types/media';
import { Poster } from '@/ui/atoms/Poster';

const STAR_ICON_SIZE = 12;
const CARD_WIDTH = 112;
const cardStyle = { width: CARD_WIDTH };
const recommendationsContentContainerStyle = { paddingHorizontal: spacing.md, gap: spacing.sm };

type RecommendationCardProps = {
  media: Media;
  onPress: (media: Media) => void;
};

const RecommendationCard = ({ media, onPress }: RecommendationCardProps) => {
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => onPress(media)}
      accessibilityRole="button"
      accessibilityLabel={media.title}
      accessibilityHint={t('common.openDetailsHint')}
      className="gap-xs"
      style={cardStyle}
    >
      <Poster path={media.posterPath} title={media.title} size="w185" />
      <Text numberOfLines={2} className="text-xs font-semibold text-text">
        {media.title}
      </Text>
      <View className="flex-row items-center gap-xs">
        <Ionicons name="star" size={STAR_ICON_SIZE} color={colors.primary} />
        <Text className="text-xs text-textMuted">{media.voteAverage.toFixed(1)}</Text>
      </View>
    </Pressable>
  );
};

type RecommendationsListProps = {
  recommendations: Media[];
  onPressMedia: (media: Media) => void;
};

// Omits itself entirely when TMDB has no recommendations for this title.
// Tapping a card navigates to that item's own details screen — see
// MovieDetailsScreen/TvDetailsScreen, which own the actual navigation call
// (recommendations are always the same mediaType as the current screen, so
// there's always a matching details route on the current stack).
export const RecommendationsList = ({
  recommendations,
  onPressMedia,
}: RecommendationsListProps) => {
  const { t } = useTranslation();

  const renderItem: ListRenderItem<Media> = useCallback(
    ({ item }) => <RecommendationCard media={item} onPress={onPressMedia} />,
    [onPressMedia],
  );

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View className="gap-sm">
      <Text className="px-md text-base font-semibold text-text">
        {t('detailsTemplate.recommendations')}
      </Text>
      <FlatList
        horizontal
        data={recommendations}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={recommendationsContentContainerStyle}
      />
    </View>
  );
};
