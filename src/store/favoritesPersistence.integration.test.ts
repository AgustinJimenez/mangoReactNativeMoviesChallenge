import AsyncStorage from '@react-native-async-storage/async-storage';

import { createAppStore } from '@/store';
import { toggleFavorite } from '@/store/favoritesSlice';

// Mirrors offlineCache.integration.test.tsx's two-session pattern, but for
// favoritesSlice instead of the api's query cache — store/index.ts's
// persistConfig.whitelist includes both, so a user's favorites need to
// survive a real app restart exactly the same way the movie list cache
// does. That was previously unverified: favoritesSlice.test.ts only
// exercises the plain reducer (add/remove/toggle), with no involvement of
// the real store, redux-persist, or AsyncStorage.
//
// Asserts on store.getState() directly rather than rendering
// FavoritesScreen: proving the persisted {id, mediaType} entries round-trip
// through AsyncStorage is the actual concern here. Rendering the screen
// would also require mocking each entry's own details-resolution fetch
// (useGetMovieDetailsQuery inside FavoriteEntryItem) — already covered by
// FavoritesScreen.test.tsx, and unrelated to what this test checks.
describe('favorites persistence integration (redux-persist + AsyncStorage)', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  // redux-persist's rehydration read from AsyncStorage is async — this
  // waits for persistor.getState().bootstrapped rather than assuming any
  // particular number of microtask ticks.
  const waitForBootstrap = (persistor: ReturnType<typeof createAppStore>['persistor']) =>
    new Promise<void>((resolve) => {
      if (persistor.getState().bootstrapped) {
        resolve();
        return;
      }
      const unsubscribe = persistor.subscribe(() => {
        if (persistor.getState().bootstrapped) {
          unsubscribe();
          resolve();
        }
      });
    });

  it('keeps a favorited title after a fresh store instance reads from AsyncStorage', async () => {
    // "Session 1": favorite a movie on a real store, letting redux-persist
    // do the actual serialize-and-write itself rather than hand-rolling
    // its on-disk format. Waiting for bootstrap before dispatching matters:
    // persistReducer only forwards state to the persistoid once rehydration
    // has completed (state._persist.rehydrated), so a dispatch before that
    // point is applied to the in-memory store but silently never queued for
    // writing — flush() then has nothing of it to write.
    const firstSession = createAppStore();
    await waitForBootstrap(firstSession.persistor);
    firstSession.store.dispatch(toggleFavorite({ id: 550, mediaType: 'movie' }));
    await firstSession.persistor.flush();

    const written = await AsyncStorage.getItem('persist:root');
    expect(written).toContain('550');

    // "Session 2": simulates the app being killed and relaunched — a brand
    // new store+persistor pair reading from the same AsyncStorage session 1
    // wrote to.
    const secondSession = createAppStore();
    await waitForBootstrap(secondSession.persistor);

    expect(secondSession.store.getState().favorites.items).toEqual([
      { id: 550, mediaType: 'movie' },
    ]);
  });

  it('keeps a removal after a restart — un-favoriting persists too, not just favoriting', async () => {
    const firstSession = createAppStore();
    await waitForBootstrap(firstSession.persistor);
    firstSession.store.dispatch(toggleFavorite({ id: 550, mediaType: 'movie' }));
    firstSession.store.dispatch(toggleFavorite({ id: 550, mediaType: 'movie' }));
    await firstSession.persistor.flush();

    const secondSession = createAppStore();
    await waitForBootstrap(secondSession.persistor);

    expect(secondSession.store.getState().favorites.items).toEqual([]);
  });
});
