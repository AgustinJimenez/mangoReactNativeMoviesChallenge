import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { colors } from '@/theme/tokens';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export const SearchBar = ({ value, onChangeText }: SearchBarProps) => {
  const { t } = useTranslation();
  const placeholder = t('searchBar.placeholder');

  return (
    <View className="flex-row items-center rounded-full bg-surface px-md py-sm">
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
    </View>
  );
};
