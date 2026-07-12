import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ROUTES } from '@/navigation/routes';
import { screenOptions, stackScreenOptions } from '@/navigation/screenOptions';
import type { TvStackParamList } from '@/navigation/types';
import { TvDetailsScreen } from '@/ui/pages/TvDetailsScreen';
import { TvListScreen } from '@/ui/pages/TvListScreen';

const Stack = createNativeStackNavigator<TvStackParamList>();

// TvListScreen renders its own big-title header (via ListTemplate) instead
// of the native-stack header, so the LanguageSwitcher lives there now — see
// ListTemplate.tsx.
export const TvStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name={ROUTES.TV_LIST}
        component={TvListScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name={ROUTES.TV_DETAILS}
        component={TvDetailsScreen}
        options={stackScreenOptions.details}
      />
    </Stack.Navigator>
  );
};
