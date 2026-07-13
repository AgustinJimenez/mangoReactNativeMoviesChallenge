import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react-native';
import type { RenderOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { api } from '@/api/tmdbApi';
import { i18next } from '@/i18n';
import { favoritesSlice } from '@/store/favoritesSlice';

// react-native-safe-area-context measures insets natively, which Jest has
// no device to do — components reading useSafeAreaInsets() (e.g. Backdrop)
// need a provided value or they throw. Using the raw context directly
// (rather than <SafeAreaProvider>, which renders its own host view to
// measure layout) keeps this a no-op wrapper like Provider/I18nextProvider
// below, so toJSON() still reflects only the component under test — several
// existing tests assert toJSON() is null when a component renders nothing.
const TEST_SAFE_AREA_INSETS = { top: 0, left: 0, right: 0, bottom: 0 };

// Mirrors store/index.ts's rootReducer shape (same reducers, same keys) so
// it's structurally assignable to RootState, without persistReducer/
// AsyncStorage — tests don't need persistence, and pulling it in would mean
// waiting on rehydration in every component test.
const testRootReducer = combineReducers({
  [api.reducerPath]: api.reducer,
  [favoritesSlice.name]: favoritesSlice.reducer,
});

export const createTestStore = () =>
  configureStore({
    reducer: testRootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });

type TestStore = ReturnType<typeof createTestStore>;

type RenderWithProvidersOptions = RenderOptions & {
  store?: TestStore;
};

export const renderWithProviders = (ui: ReactElement, options: RenderWithProvidersOptions = {}) => {
  const { store = createTestStore(), ...renderOptions } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <I18nextProvider i18n={i18next}>
        <SafeAreaInsetsContext.Provider value={TEST_SAFE_AREA_INSETS}>
          {children}
        </SafeAreaInsetsContext.Provider>
      </I18nextProvider>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};
