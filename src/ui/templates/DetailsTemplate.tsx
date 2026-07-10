import { useTranslation } from 'react-i18next';
import { ScrollView, Text, View } from 'react-native';

import type { MediaDetails } from '@/types/media';
import { ErrorState } from '@/ui/molecules/ErrorState';
import { LoadingState } from '@/ui/molecules/LoadingState';
import { MediaDetailsHeader } from '@/ui/organisms/MediaDetailsHeader';

type DetailsTemplateProps = {
  media: MediaDetails | undefined;
  isLoading: boolean;
  isError: boolean;
  errorStatus?: number;
  onRetry: () => void;
};

export const DetailsTemplate = ({
  media,
  isLoading,
  isError,
  errorStatus,
  onRetry,
}: DetailsTemplateProps) => {
  const { t } = useTranslation();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !media) {
    return <ErrorState status={errorStatus} onRetry={onRetry} />;
  }

  return (
    <ScrollView className="flex-1 bg-background">
      <MediaDetailsHeader media={media} />
      <View className="p-md">
        <Text className="text-base font-semibold text-text">{t('detailsTemplate.overview')}</Text>
        <Text className="mt-xs text-sm text-textMuted">{media.overview}</Text>
      </View>
    </ScrollView>
  );
};
