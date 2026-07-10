import { NavigationContainer } from '@react-navigation/native';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { i18next } from '@/i18n';
import { persistor, store } from '@/store';

type AppProvidersProps = {
  children: ReactNode;
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
});

// TODO(step 8): swap this fallback for ui/molecules/LoadingState once it exists.
const PersistGateFallback = () => (
  <View className="flex-1 items-center justify-center bg-slate-900">
    <ActivityIndicator />
  </View>
);

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <GestureHandlerRootView style={styles.flex1}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate loading={<PersistGateFallback />} persistor={persistor}>
            <I18nextProvider i18n={i18next}>
              <NavigationContainer>{children}</NavigationContainer>
            </I18nextProvider>
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};
