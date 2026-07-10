import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/navigation/routes';
import { screenOptions, stackScreenOptions } from '@/navigation/screenOptions';
import type { MoviesStackParamList } from '@/navigation/types';
import { MovieDetailsScreen } from '@/ui/pages/MovieDetailsScreen';
import { MoviesListScreen } from '@/ui/pages/MoviesListScreen';

const Stack = createNativeStackNavigator<MoviesStackParamList>();

export const MoviesStackNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name={ROUTES.MOVIES_LIST}
        component={MoviesListScreen}
        options={{ title: t('navigation.moviesTab') }}
      />
      <Stack.Screen
        name={ROUTES.MOVIE_DETAILS}
        component={MovieDetailsScreen}
        options={stackScreenOptions.details}
      />
    </Stack.Navigator>
  );
};
