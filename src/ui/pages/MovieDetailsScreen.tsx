import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { useGetMovieDetailsQuery } from '@/api/tmdbApi';
import { useActiveLocale } from '@/hooks/useActiveLocale';
import { useMediaDetailsScreen } from '@/hooks/useMediaDetailsScreen';
import { ROUTES } from '@/navigation/routes';
import type { RootStackParamList } from '@/navigation/types';
import { DetailsTemplate } from '@/ui/templates/DetailsTemplate';

export const MovieDetailsScreen = () => {
  const { params } = useRoute<RouteProp<RootStackParamList, 'MovieDetails'>>();
  const language = useActiveLocale();
  const query = useGetMovieDetailsQuery({ id: params.id, language });
  const detailsTemplateProps = useMediaDetailsScreen(query, ROUTES.MOVIE_DETAILS);

  return <DetailsTemplate {...detailsTemplateProps} />;
};
