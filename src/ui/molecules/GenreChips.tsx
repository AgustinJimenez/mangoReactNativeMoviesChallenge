import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import type { MediaType } from '@/types/common';
import { MOVIE_GENRE_IDS, resolveGenreName, TV_GENRE_IDS } from '@/utils/genres';

type GenreChipsProps = {
  mediaType: MediaType;
  value: number | null;
  onChange: (genreId: number | null) => void;
};

// Wraps to multiple rows instead of scrolling horizontally (compare the
// old GenreFilterRow) — every genre is reachable without hidden overflow,
// which matters more here since this is the only genre control left. Used
// inside FiltersModal's sheet.
export const GenreChips = ({ mediaType, value, onChange }: GenreChipsProps) => {
  const { t } = useTranslation();
  const genreIds = mediaType === 'movie' ? MOVIE_GENRE_IDS : TV_GENRE_IDS;
  const chips: Array<{ id: number | null; label: string }> = [
    { id: null, label: t('genreFilter.all') },
    ...genreIds.map((id) => ({ id, label: resolveGenreName(id, mediaType, t) ?? String(id) })),
  ];

  return (
    <View className="flex-row flex-wrap gap-xs">
      {chips.map((chip) => {
        const isSelected = chip.id === value;
        const chipClassName = isSelected
          ? 'rounded-full bg-primary px-md py-xs'
          : 'rounded-full border border-border bg-background px-md py-xs';
        const labelClassName = isSelected
          ? 'text-xs font-bold text-background'
          : 'text-xs text-textMuted';

        return (
          <Pressable
            key={String(chip.id ?? 'all')}
            onPress={() => onChange(chip.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={chip.label}
            className={chipClassName}
          >
            <Text className={labelClassName}>{chip.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};
