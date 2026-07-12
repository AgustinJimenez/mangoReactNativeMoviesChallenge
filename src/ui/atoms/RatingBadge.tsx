import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { colors } from '@/theme/tokens';

const STAR_ICON_SIZE = 14;
const MAX_RATING = 10;

type RatingBadgeProps = {
  voteAverage: number;
  voteCount: number;
};

// Memoized: rendered once per row in list FlatLists, props are two numbers.
export const RatingBadge = memo(({ voteAverage, voteCount }: RatingBadgeProps) => {
  const { t } = useTranslation();

  if (voteCount === 0) {
    return <Text className="text-xs text-textMuted">{t('rating.noVotes')}</Text>;
  }

  const fillPercent = (voteAverage / MAX_RATING) * 100;

  return (
    <View className="flex-row items-center gap-xs">
      <Ionicons name="star" size={STAR_ICON_SIZE} color={colors.primary} />
      <Text className="text-xs font-bold text-text">{voteAverage.toFixed(1)}</Text>
      <Text className="text-xs text-textMuted">/10</Text>
      <View className="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
        <View className="h-full rounded-full bg-primary" style={{ width: `${fillPercent}%` }} />
      </View>
    </View>
  );
});
