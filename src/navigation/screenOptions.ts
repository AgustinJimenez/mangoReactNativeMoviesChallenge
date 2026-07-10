import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors } from '@/theme/tokens';

// React Navigation's screenOptions take plain style objects, not className —
// NativeWind has no hook into header/tab bar internals, so these read
// straight from theme/tokens.ts instead.
export const screenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  contentStyle: { backgroundColor: colors.background },
};

// Detail screens don't know their title (the movie/show name) until their
// query resolves, so they start blank and call navigation.setOptions({
// title }) once data loads instead of showing the technical route name.
export const stackScreenOptions = {
  details: { title: '' } satisfies NativeStackNavigationOptions,
};
