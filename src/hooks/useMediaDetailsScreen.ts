import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';

import { useDetailsHeaderShare } from '@/hooks/useDetailsHeaderShare';
import type { RootStackParamList } from '@/navigation/types';
import type { Media, MediaDetails } from '@/types/media';
import { getErrorStatus } from '@/utils/rtkQueryError';

// Structurally matches both useGetMovieDetailsQuery's and
// useGetTvDetailsQuery's result shape — both endpoints declare
// builder.query<MediaDetails, MediaDetailsArgs>, so this hook can drive
// whichever one a screen actually calls without needing to know which.
type MediaDetailsQuery = {
  data?: MediaDetails;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error?: unknown;
  refetch: () => void;
};

type DetailsRoute = 'MovieDetails' | 'TvDetails';

// Shared by MovieDetailsScreen/TvDetailsScreen — the only things that
// differ between the two are which RTK Query hook gets called (a separate
// generated hook per endpoint) and which route recommendations push to.
// The share-button header effect and DetailsTemplate's prop assembly are
// identical, so they live here once.
export const useMediaDetailsScreen = (query: MediaDetailsQuery, detailsRoute: DetailsRoute) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  useDetailsHeaderShare(query.data);

  const handlePressRecommendation = useCallback(
    (media: Media) => {
      navigation.push(detailsRoute, { id: media.id });
    },
    [navigation, detailsRoute],
  );

  return {
    media: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    errorStatus: getErrorStatus(query.error),
    onRetry: query.refetch,
    onPressRecommendation: handlePressRecommendation,
  };
};
