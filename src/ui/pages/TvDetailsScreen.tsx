import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import { useGetTvDetailsQuery } from '@/api';
import { useActiveLocale } from '@/hooks/useActiveLocale';
import { useMediaDetailsScreen } from '@/hooks/useMediaDetailsScreen';
import { ROUTES } from '@/navigation/routes';
import type { RootStackParamList } from '@/navigation/types';
import { DetailsTemplate } from '@/ui/templates/DetailsTemplate';

export const TvDetailsScreen = () => {
  const { params } = useRoute<RouteProp<RootStackParamList, 'TvDetails'>>();
  const language = useActiveLocale();
  const query = useGetTvDetailsQuery({ id: params.id, language });
  const detailsTemplateProps = useMediaDetailsScreen(query, ROUTES.TV_DETAILS);

  return <DetailsTemplate {...detailsTemplateProps} />;
};
