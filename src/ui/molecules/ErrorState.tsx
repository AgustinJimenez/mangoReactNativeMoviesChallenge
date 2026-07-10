import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

const HTTP_UNAUTHORIZED = 401;

type ErrorStateProps = {
  status?: number;
  onRetry: () => void;
};

export const ErrorState = ({ status, onRetry }: ErrorStateProps) => {
  const { t } = useTranslation();
  const message =
    status === HTTP_UNAUTHORIZED ? t('errorState.unauthorized') : t('errorState.generic');

  return (
    <View className="flex-1 items-center justify-center gap-md bg-background p-lg">
      <Text className="text-center text-base text-text">{message}</Text>
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={t('retry')}
        className="rounded-full bg-primary px-lg py-sm"
      >
        <Text className="font-semibold text-background">{t('retry')}</Text>
      </Pressable>
    </View>
  );
};
