import { NavigationContainer } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { i18next } from '@/i18n';
import { persistor, store } from '@/store';
import { LoadingState } from '@/ui/molecules/LoadingState';

type AppProvidersProps = {
  children: ReactNode;
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <GestureHandlerRootView style={styles.flex1}>
      {/* initialWindowMetrics avoids a first-paint layout glitch on Android
          (bottom tab bar briefly measured against zero insets before the
          native module delivers real ones — visible as a ghost duplicate
          tab bar near the status bar on edge-to-edge Android 15+). */}
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <Provider store={store}>
          <PersistGate loading={<LoadingState />} persistor={persistor}>
            <I18nextProvider i18n={i18next}>
              <NavigationContainer>{children}</NavigationContainer>
            </I18nextProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
