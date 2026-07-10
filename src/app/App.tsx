/**
 * @format
 */

import '../global.css';

import { StatusBar, Text, View, useColorScheme } from 'react-native';

import { ErrorBoundary } from './ErrorBoundary';
import { AppProviders } from './providers/AppProviders';

// TODO(step 12): replace with RootNavigator once navigation is configured.
const AppContent = () => {
  return (
    <View className="flex-1 items-center justify-center bg-slate-900">
      <Text className="text-2xl font-bold text-white">NativeWind smoke test</Text>
    </View>
  );
};

export const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <ErrorBoundary>
      <AppProviders>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </AppProviders>
    </ErrorBoundary>
  );
};
