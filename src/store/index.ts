import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  createTransform,
  persistReducer,
  persistStore,
} from 'redux-persist';

import { tmdbApi } from '@/api/tmdbApi';
import { favoritesSlice } from '@/store/favoritesSlice';

type TmdbApiState = ReturnType<typeof tmdbApi.reducer>;

// Only the resolved query cache is worth persisting across app restarts —
// subscriptions/config/mutations/provided are transient RTK Query bookkeeping
// that should always start fresh, not be restored from disk.
const tmdbApiTransform = createTransform<TmdbApiState, Pick<TmdbApiState, 'queries'>>(
  (inboundState) => ({ queries: inboundState.queries }),
  (outboundState) => ({
    ...tmdbApi.reducer(undefined, { type: '@@INIT' }),
    queries: outboundState.queries,
  }),
  { whitelist: [tmdbApi.reducerPath] },
);

const rootReducer = combineReducers({
  [tmdbApi.reducerPath]: tmdbApi.reducer,
  [favoritesSlice.name]: favoritesSlice.reducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [tmdbApi.reducerPath, favoritesSlice.name],
  transforms: [tmdbApiTransform],
};

// persistReducer expects a reducer whose state param accepts `undefined`/partial
// state (it may call the wrapped reducer before rehydration completes), but
// combineReducers' output type requires the full combined state — a known,
// long-standing friction point between redux-persist and RTK Query's typings
// (not a runtime bug). combineReducers already handles undefined state for
// each slice internally, so this cast is safe.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const persistedReducer = persistReducer(persistConfig, rootReducer as any);

// Factory rather than building the singleton below inline — the offline-
// cache integration test (src/store/offlineCache.integration.test.tsx) needs
// a genuinely fresh store+persistor pair reading from whatever's already in
// AsyncStorage, to simulate a real app restart, without duplicating this
// construction logic (and risking it drifting from what the app actually
// runs) or resetting Jest's module registry (which would also wipe the
// AsyncStorage mock's in-memory backing).
export const createAppStore = () => {
  const newStore = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        // Details responses cache cast/videos/recommendations/release_dates
        // alongside the core fields, so the dev-only immutable/serializable
        // deep-equality checks routinely exceed RTK's default 32ms warning
        // threshold on this slice even though nothing is actually slow —
        // bump both instead of the checks firing on every details screen.
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
          warnAfter: 128,
        },
        immutableCheck: { warnAfter: 128 },
      }).concat(tmdbApi.middleware),
  });
  const newPersistor = persistStore(newStore);
  return { store: newStore, persistor: newPersistor };
};

const appStore = createAppStore();
export const store = appStore.store;
export const persistor = appStore.persistor;

// Typed from rootReducer directly rather than `store.getState()`: the `any`
// cast a few lines up (needed to satisfy persistReducer's parameter type)
// otherwise poisons inference all the way through to here, turning every
// useAppSelector call in the app into implicit `any`. rootReducer's own
// return type is unaffected by that cast and is the exact shape app code
// actually selects from (redux-persist only adds an internal `_persist`
// field at runtime, which nothing in this app reads).
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
