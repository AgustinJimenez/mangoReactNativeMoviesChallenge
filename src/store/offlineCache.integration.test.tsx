import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { i18next } from '@/i18n';
import { ROUTES } from '@/navigation/routes';
import type { RootStackParamList } from '@/navigation/types';
import { createAppStore } from '@/store';
import { MoviesListScreen } from '@/ui/pages/MoviesListScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Mirrors AppProviders.tsx's real provider stack (minus SafeAreaProvider/
// GestureHandlerRootView, which don't affect this) — unlike testUtils.tsx's
// renderWithProviders, this uses a real PersistGate + a real store/persistor
// pair (see createAppStore below), not the simplified persistence-free
// createTestStore. That's the whole point here: this file exists to
// exercise redux-persist + AsyncStorage for real.
const renderMoviesListScreen = (session: ReturnType<typeof createAppStore>) =>
  render(
    <Provider store={session.store}>
      <PersistGate loading={null} persistor={session.persistor}>
        <I18nextProvider i18n={i18next}>
          <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name={ROUTES.MOVIES_LIST} component={MoviesListScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </I18nextProvider>
      </PersistGate>
    </Provider>,
  );

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const POPULAR_MOVIES_RESPONSE = {
  page: 1,
  results: [
    {
      id: 550,
      title: 'Fight Club',
      poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      vote_average: 8.4,
      vote_count: 26000,
      overview: 'A ticking-time-bomb insomniac and a slippery soap salesman...',
      genre_ids: [18, 53],
    },
  ],
  total_pages: 5,
  total_results: 100,
};

// Exercises the real store (src/store/index.ts) end to end, including
// redux-persist + AsyncStorage. testUtils.tsx's renderWithProviders
// deliberately skips persistence for every other component/screen test
// (see its own comment there) — right for those, but it meant the actual
// "survives an app restart" mechanism, and what the UI does when a
// background refetch of already-cached data fails, had zero test coverage.
// Verified manually first against the real emulator with wifi disabled
// mid-session (force-stop the app, disable wifi+data, relaunch — the debug
// build can't even load its JS bundle from Metro with no network at all,
// so the real check was: load a list live, cut network without restarting
// the app, then scroll to trigger a new page fetch — confirmed the stale
// list stayed up with "Couldn't refresh, showing saved data"). These tests
// lock that behavior in without needing a real device.
describe('offline cache integration (redux-persist + RTK Query)', () => {
  afterEach(async () => {
    jest.restoreAllMocks();
    await AsyncStorage.clear();
  });

  it('serves a movie list from AsyncStorage on a fresh store instance, before any network request resolves', async () => {
    // "Session 1": a real successful fetch against a real store, letting
    // redux-persist do the actual serialize-and-write itself rather than
    // hand-rolling its on-disk format — fragile, and easy to get subtly
    // wrong in a way that makes the test pass for the wrong reason.
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(POPULAR_MOVIES_RESPONSE));
    const firstSession = createAppStore();
    const first = renderMoviesListScreen(firstSession);
    await waitFor(() => expect(first.getByText('Fight Club')).toBeTruthy());

    // redux-persist debounces writes to storage — flush explicitly instead
    // of guessing at a delay.
    await firstSession.persistor.flush();
    const written = await AsyncStorage.getItem('persist:root');
    expect(written).toContain('Fight Club');
    first.unmount();

    // "Session 2": simulates the app being killed and relaunched — a brand
    // new store+persistor pair (a second createAppStore() call, not the
    // same instance), reading from the same AsyncStorage session 1 wrote
    // to. The network now fails outright, so if the title renders, it can
    // only have come from the rehydrated cache, never from a fetch.
    jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network request failed'));
    const secondSession = createAppStore();
    const second = renderMoviesListScreen(secondSession);

    // Loading… must never appear — the data has to be there from the very
    // first render, not arrive after a beat.
    expect(second.queryByText('Loading…')).toBeNull();
    await waitFor(() => expect(second.getByText('Fight Club')).toBeTruthy());
  });

  it('keeps showing cached results and a stale-data notice when a background refetch fails', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(POPULAR_MOVIES_RESPONSE));
    const session = createAppStore();
    const { getByText, getByTestId } = renderMoviesListScreen(session);
    await waitFor(() => expect(getByText('Fight Club')).toBeTruthy());

    jest.mocked(globalThis.fetch).mockRejectedValue(new Error('Network request failed'));
    fireEvent(getByTestId('media-list'), 'refresh');

    await waitFor(() => expect(getByText("Couldn't refresh, showing saved data")).toBeTruthy());
    // The stale list must still be there — a failed background refetch
    // must not blank the screen or fall back to a blocking ErrorState.
    expect(getByText('Fight Club')).toBeTruthy();
  });
});
