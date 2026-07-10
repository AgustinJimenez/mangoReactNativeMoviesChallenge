import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react-native';
import type { RenderOptions } from '@testing-library/react-native';
import type { ReactElement, ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';

import { tmdbApi } from '@/api/tmdbApi';
import { i18next } from '@/i18n';
import { favoritesSlice } from '@/store/favoritesSlice';

// Mirrors store/index.ts's rootReducer shape (same reducers, same keys) so
// it's structurally assignable to RootState, without persistReducer/
// AsyncStorage — tests don't need persistence, and pulling it in would mean
// waiting on rehydration in every component test.
const testRootReducer = combineReducers({
  [tmdbApi.reducerPath]: tmdbApi.reducer,
  [favoritesSlice.name]: favoritesSlice.reducer,
});

export const createTestStore = () =>
  configureStore({
    reducer: testRootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(tmdbApi.middleware),
  });

type TestStore = ReturnType<typeof createTestStore>;

type RenderWithProvidersOptions = RenderOptions & {
  store?: TestStore;
};

export const renderWithProviders = (ui: ReactElement, options: RenderWithProvidersOptions = {}) => {
  const { store = createTestStore(), ...renderOptions } = options;

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};
