import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

type OverviewSectionProps = {
  overview: string;
};

// TMDB's per-language overview isn't always filled in even when the title
// has data in other fields (e.g. an English synopsis but nothing
// translated for es-ES yet). Keeps the "Sinopsis" header and swaps in a
// "no overview available" message instead of the real text — same
// treatment RatingRow gives voteCount === 0 ("No votes"), rather than
// hiding the section outright: unlike Cast/Trailer/Recommendations
// (naturally sparse for niche titles, where silent omission reads as
// normal), a synopsis is a primary field users expect to see something
// for, so an explicit "not available" reads as intentional rather than
// broken.
export const OverviewSection = ({ overview }: OverviewSectionProps) => {
  const { t } = useTranslation();
  const overviewText = overview.length > 0 ? overview : t('detailsTemplate.noOverview');

  return (
    <View className="px-md">
      <Text className="text-base font-semibold text-text">{t('detailsTemplate.overview')}</Text>
      <Text className="mt-xs text-sm text-textMuted">{overviewText}</Text>
    </View>
  );
};
