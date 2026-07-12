import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors } from '@/theme/tokens';
import { BackButton } from '@/ui/molecules/BackButton';

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
//
// headerTransparent floats the back arrow/title/share button over the
// backdrop image (see Backdrop.tsx) instead of stacking a solid header bar
// above it. headerLeft is a custom BackButton (not the native-stack
// default) because the default back arrow has no background of its own —
// legible over the shared screenOptions' opaque header, but not over a
// bright backdrop image.
export const stackScreenOptions = {
  // headerTransparent alone isn't enough — the shared screenOptions above
  // already sets an opaque headerStyle.backgroundColor, which keeps
  // painting over the backdrop unless explicitly reset to transparent here.
  details: {
    title: '',
    headerTransparent: true,
    headerStyle: { backgroundColor: 'transparent' },
    headerLeft: () => <BackButton />,
  } satisfies NativeStackNavigationOptions,
};
