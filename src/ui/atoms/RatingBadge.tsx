import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

type RatingBadgeProps = {
  voteAverage: number;
  voteCount: number;
};

export const RatingBadge = ({ voteAverage, voteCount }: RatingBadgeProps) => {
  const { t } = useTranslation();
  const label = voteCount > 0 ? voteAverage.toFixed(1) : t('rating.noVotes');

  return (
    <View className="flex-row items-center gap-xs rounded-full bg-black/60 px-sm py-xs">
      <Text className="text-xs font-bold text-primary">★</Text>
      <Text className="text-xs font-bold text-text">{label}</Text>
    </View>
  );
};
