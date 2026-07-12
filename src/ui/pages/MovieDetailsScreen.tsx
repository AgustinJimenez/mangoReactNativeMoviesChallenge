import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';

import { useGetMovieDetailsQuery } from '@/api/tmdbApi';
import { useActiveLocale } from '@/hooks/useActiveLocale';
import { useDetailsHeaderShare } from '@/hooks/useDetailsHeaderShare';
import { ROUTES } from '@/navigation/routes';
import type { RootStackParamList } from '@/navigation/types';
import type { Media } from '@/types/media';
import { DetailsTemplate } from '@/ui/templates/DetailsTemplate';
import { getErrorStatus } from '@/utils/rtkQueryError';

export const MovieDetailsScreen = () => {
  const { params } = useRoute<RouteProp<RootStackParamList, 'MovieDetails'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const language = useActiveLocale();
  const { data, isLoading, isFetching, isError, error, refetch } = useGetMovieDetailsQuery({
    id: params.id,
    language,
  });
  useDetailsHeaderShare(data);

  const handlePressRecommendation = useCallback(
    (media: Media) => {
      navigation.push(ROUTES.MOVIE_DETAILS, { id: media.id });
    },
    [navigation],
  );

  return (
    <DetailsTemplate
      media={data}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      errorStatus={getErrorStatus(error)}
      onRetry={refetch}
      onPressRecommendation={handlePressRecommendation}
    />
  );
};
