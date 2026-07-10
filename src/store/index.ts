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

// favoritesSlice gets added to this reducer map, and to persistConfig.whitelist, in an upcoming step.
const rootReducer = combineReducers({
  [tmdbApi.reducerPath]: tmdbApi.reducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [tmdbApi.reducerPath],
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

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(tmdbApi.middleware),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
