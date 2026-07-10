import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Text, View } from 'react-native';

export const LoadingState = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center gap-sm bg-background p-lg">
      <ActivityIndicator />
      <Text className="text-sm text-textMuted">{t('loadingState.message')}</Text>
    </View>
  );
};
