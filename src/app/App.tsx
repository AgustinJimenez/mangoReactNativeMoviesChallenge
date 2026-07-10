/**
 * @format
 */

import '../global.css';

import { StatusBar, useColorScheme } from 'react-native';

import { RootNavigator } from '@/navigation/RootNavigator';
import { OfflineBanner } from '@/ui/molecules/OfflineBanner';

import { ErrorBoundary } from './ErrorBoundary';
import { AppProviders } from './providers/AppProviders';

export const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ErrorBoundary>
      <AppProviders>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {/* Before RootNavigator (not absolutely positioned) so it pushes
            content down when it appears, instead of overlaying the native
            stack header. Mounted once here — see OfflineBanner.tsx — so
            it's visible regardless of which tab/screen is active. */}
        <OfflineBanner />
        <RootNavigator />
      </AppProviders>
    </ErrorBoundary>
  );
};
