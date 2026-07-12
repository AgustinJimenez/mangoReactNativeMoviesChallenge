import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';

import { FavoritesStackNavigator } from '@/navigation/FavoritesStackNavigator';
import { MoviesStackNavigator } from '@/navigation/MoviesStackNavigator';
import { ROUTES } from '@/navigation/routes';
import { TvStackNavigator } from '@/navigation/TvStackNavigator';
import type { RootTabParamList } from '@/navigation/types';
import { colors } from '@/theme/tokens';

type TabIconProps = { color: string; size: number; focused: boolean };

// Defined at module scope (not inline in Tab.Screen's options) so React
// Navigation sees a stable component type across renders instead of
// remounting the icon every time RootNavigator re-renders. Outline when
// inactive, filled when focused — a common tab bar affordance for "which
// section am I in".
const MoviesTabIcon = ({ color, size, focused }: TabIconProps) => (
  <Ionicons name={focused ? 'film' : 'film-outline'} size={size} color={color} />
);
const TvTabIcon = ({ color, size, focused }: TabIconProps) => (
  <Ionicons name={focused ? 'tv' : 'tv-outline'} size={size} color={color} />
);
const FavoritesTabIcon = ({ color, size, focused }: TabIconProps) => (
  <Ionicons name={focused ? 'heart' : 'heart-outline'} size={size} color={color} />
);

const Tab = createBottomTabNavigator<RootTabParamList>();

export const RootNavigator = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen
        name={ROUTES.MOVIES_TAB}
        component={MoviesStackNavigator}
        options={{
          title: t('navigation.moviesTab'),
          tabBarIcon: MoviesTabIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.TV_TAB}
        component={TvStackNavigator}
        options={{
          title: t('navigation.tvTab'),
          tabBarIcon: TvTabIcon,
        }}
      />
      <Tab.Screen
        name={ROUTES.FAVORITES_TAB}
        component={FavoritesStackNavigator}
        options={{
          title: t('navigation.favoritesTab'),
          tabBarIcon: FavoritesTabIcon,
        }}
      />
    </Tab.Navigator>
  );
};
