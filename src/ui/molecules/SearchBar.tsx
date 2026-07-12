import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';

import { colors } from '@/theme/tokens';

const SEARCH_ICON_SIZE = 18;
const FILTER_ICON_SIZE = 18;

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  // Both optional: the trailing filter icon only renders when a caller
  // passes onFilterPress (ListTemplate omits it for FavoritesScreen, and
  // while a search is active — see SearchAndFilters).
  onFilterPress?: () => void;
  isFilterActive?: boolean;
};

export const SearchBar = ({
  value,
  onChangeText,
  onFilterPress,
  isFilterActive,
}: SearchBarProps) => {
  const { t } = useTranslation();
  const placeholder = t('searchBar.placeholder');

  return (
    <View className="flex-row items-center gap-sm rounded-full border border-border bg-surface px-md py-xs">
      <Ionicons name="search" size={SEARCH_ICON_SIZE} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel={placeholder}
        testID="search-bar-input"
        className="flex-1 text-base text-text"
      />
      {onFilterPress && (
        <Pressable
          onPress={onFilterPress}
          accessibilityRole="button"
          accessibilityLabel={t('filtersModal.title')}
          testID="search-bar-filter-button"
          className="relative"
        >
          <Ionicons name="options-outline" size={FILTER_ICON_SIZE} color={colors.textMuted} />
          {isFilterActive && (
            <View
              testID="search-bar-filter-indicator"
              className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-primary"
            />
          )}
        </Pressable>
      )}
    </View>
  );
};
