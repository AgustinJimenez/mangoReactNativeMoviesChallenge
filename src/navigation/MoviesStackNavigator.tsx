import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ROUTES } from '@/navigation/routes';
import { screenOptions, stackScreenOptions } from '@/navigation/screenOptions';
import type { MoviesStackParamList } from '@/navigation/types';
import { MovieDetailsScreen } from '@/ui/pages/MovieDetailsScreen';
import { MoviesListScreen } from '@/ui/pages/MoviesListScreen';

const Stack = createNativeStackNavigator<MoviesStackParamList>();

// MoviesListScreen renders its own big-title header (via ListTemplate)
// instead of the native-stack header, so the LanguageSwitcher lives there
// now — see ListTemplate.tsx.
export const MoviesStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name={ROUTES.MOVIES_LIST}
        component={MoviesListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.MOVIE_DETAILS}
        component={MovieDetailsScreen}
        options={stackScreenOptions.details}
      />
    </Stack.Navigator>
  );
};
