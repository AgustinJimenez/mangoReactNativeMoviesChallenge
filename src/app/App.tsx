/**
 * @format
 */

import '../global.css';

import { StatusBar } from 'react-native';

import { RootNavigator } from '@/navigation/RootNavigator';
import { OfflineBanner } from '@/ui/molecules/OfflineBanner';

import { ErrorBoundary } from './ErrorBoundary';
import { AppProviders } from './providers/AppProviders';

export const App = () => {
  return (
    <ErrorBoundary>
      <AppProviders>
        {/* The app has a single, always-dark theme (theme/tokens.ts) — no
            light mode to switch to — so this doesn't follow the OS color
            scheme like a typical light/dark-aware app would. */}
        <StatusBar barStyle="light-content" />
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
