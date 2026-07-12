import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ROUTES } from '@/navigation/routes';
import { screenOptions, stackScreenOptions } from '@/navigation/screenOptions';
import type { FavoritesStackParamList } from '@/navigation/types';
import { FavoritesScreen } from '@/ui/pages/FavoritesScreen';
import { MovieDetailsScreen } from '@/ui/pages/MovieDetailsScreen';
import { TvDetailsScreen } from '@/ui/pages/TvDetailsScreen';

const Stack = createNativeStackNavigator<FavoritesStackParamList>();

// FavoritesScreen renders its own big-title header (via ListTemplate)
// instead of the native-stack header, so the LanguageSwitcher lives there
// now — see ListTemplate.tsx.
export const FavoritesStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name={ROUTES.FAVORITES_LIST}
        component={FavoritesScreen}
        options={{ headerShown: false }}
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
