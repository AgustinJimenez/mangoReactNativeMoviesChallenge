/**
 * @format
 */

import '../global.css';

import { StatusBar, useColorScheme } from 'react-native';

import { RootNavigator } from '@/navigation/RootNavigator';

import { ErrorBoundary } from './ErrorBoundary';
import { AppProviders } from './providers/AppProviders';

export const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ErrorBoundary>
      <AppProviders>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <RootNavigator />
      </AppProviders>
    </ErrorBoundary>
  );
};
