import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { ROUTES } from '@/navigation/routes';
import { screenOptions, stackScreenOptions } from '@/navigation/screenOptions';
import type { TvStackParamList } from '@/navigation/types';
import { LanguageSwitcher } from '@/ui/molecules/LanguageSwitcher';
import { TvDetailsScreen } from '@/ui/pages/TvDetailsScreen';
import { TvListScreen } from '@/ui/pages/TvListScreen';

const Stack = createNativeStackNavigator<TvStackParamList>();

const renderLanguageSwitcher = () => <LanguageSwitcher />;

export const TvStackNavigator = () => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name={ROUTES.TV_LIST}
        component={TvListScreen}
        options={{ title: t('navigation.tvTab'), headerRight: renderLanguageSwitcher }}
      />
      <Stack.Screen
        name={ROUTES.TV_DETAILS}
        component={TvDetailsScreen}
        options={stackScreenOptions.details}
      />
    </Stack.Navigator>
  );
};
