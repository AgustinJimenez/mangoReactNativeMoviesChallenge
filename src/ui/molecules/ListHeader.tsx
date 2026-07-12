import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing } from '@/theme/tokens';
import { LanguageSwitcher } from '@/ui/molecules/LanguageSwitcher';

type ListHeaderProps = {
  title: string;
  subtitle?: string;
};

// Replaces the native-stack header on list screens (see
// */StackNavigator.tsx, which set headerShown: false for their list route)
// so the title/subtitle/LanguageSwitcher can use the bigger, card-style
// layout from the redesign instead of the native header bar.
export const ListHeader = ({ title, subtitle }: ListHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="gap-xs border-b border-border px-md pb-md"
      style={{ paddingTop: insets.top + spacing.md }}
    >
      <View className="flex-row items-start justify-between gap-md">
        <View className="flex-1 gap-xs">
          <Text className="text-2xl font-bold text-text">{title}</Text>
          {subtitle && <Text className="text-sm text-textMuted">{subtitle}</Text>}
        </View>
        <LanguageSwitcher />
      </View>
    </View>
  );
};
