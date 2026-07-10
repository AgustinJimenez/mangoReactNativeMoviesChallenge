import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { useGetTvDetailsQuery } from '@/api/tmdbApi';
import { useActiveLocale } from '@/hooks/useActiveLocale';
import type { RootStackParamList } from '@/navigation/types';
import { DetailsTemplate } from '@/ui/templates/DetailsTemplate';
import { getErrorStatus } from '@/utils/rtkQueryError';

export const TvDetailsScreen = () => {
  const { params } = useRoute<RouteProp<RootStackParamList, 'TvDetails'>>();
  const language = useActiveLocale();
  const { data, isLoading, isError, error, refetch } = useGetTvDetailsQuery({
    id: params.id,
    language,
  });

  return (
    <DetailsTemplate
      media={data}
      isLoading={isLoading}
      isError={isError}
      errorStatus={getErrorStatus(error)}
      onRetry={refetch}
    />
  );
};
