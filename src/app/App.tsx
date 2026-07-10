/**
 * @format
 */

import '../global.css';

import { useTranslation } from 'react-i18next';
import { StatusBar, Text, View, useColorScheme } from 'react-native';

import { ErrorBoundary } from './ErrorBoundary';
import { AppProviders } from './providers/AppProviders';

// TODO(step 12): replace with RootNavigator once navigation is configured.
const AppContent = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-bold text-text">{t('smokeTestPlaceholder')}</Text>
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
