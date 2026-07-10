import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/navigation/routes';
import { screenOptions, stackScreenOptions } from '@/navigation/screenOptions';
import type { FavoritesStackParamList } from '@/navigation/types';
import { LanguageSwitcher } from '@/ui/molecules/LanguageSwitcher';
import { FavoritesScreen } from '@/ui/pages/FavoritesScreen';
import { MovieDetailsScreen } from '@/ui/pages/MovieDetailsScreen';
import { TvDetailsScreen } from '@/ui/pages/TvDetailsScreen';

const Stack = createNativeStackNavigator<FavoritesStackParamList>();

const renderLanguageSwitcher = () => <LanguageSwitcher />;

export const FavoritesStackNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name={ROUTES.FAVORITES_LIST}
        component={FavoritesScreen}
        options={{ title: t('navigation.favoritesTab'), headerRight: renderLanguageSwitcher }}
      />
      <Stack.Screen
        name={ROUTES.MOVIE_DETAILS}
        component={MovieDetailsScreen}
        options={stackScreenOptions.details}
      />
      <Stack.Screen
        name={ROUTES.TV_DETAILS}
        component={TvDetailsScreen}
        options={stackScreenOptions.details}
      />
    </Stack.Navigator>
  );
};
