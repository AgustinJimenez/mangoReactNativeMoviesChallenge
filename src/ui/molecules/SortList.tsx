import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import type { SortBy } from '@/api/tmdbApi';

const SORT_OPTIONS: SortBy[] = ['popularity', 'rating', 'newest', 'title'];

type SortListProps = {
  value: SortBy;
  onChange: (sortBy: SortBy) => void;
};

// Vertical list of sort options, used inside FiltersModal's sheet.
export const SortList = ({ value, onChange }: SortListProps) => {
  const { t } = useTranslation();

  return (
    <View className="gap-xs">
      {SORT_OPTIONS.map((option) => {
        const isSelected = option === value;
        const rowClassName = isSelected
          ? 'rounded-lg bg-primary/10 px-md py-sm'
          : 'rounded-lg px-md py-sm';
        const labelClassName = isSelected ? 'text-sm font-bold text-primary' : 'text-sm text-text';

        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={t(`sort.${option}`)}
            className={rowClassName}
          >
            <Text className={labelClassName}>{t(`sort.${option}`)}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};
