import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { ROUTES } from '@/navigation/routes';
import type { RootStackParamList } from '@/navigation/types';
import { createTestStore, renderWithProviders } from '@/testUtils';
import { MoviesListScreen } from '@/ui/pages/MoviesListScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// MoviesListScreen calls useNavigation(), which needs a real Screen/Navigator
// context (not just a bare NavigationContainer) to resolve — mirrors how the
// app itself mounts this screen inside MoviesStackNavigator.
const renderMoviesListScreen = () =>
  renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name={ROUTES.MOVIES_LIST} component={MoviesListScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
    { store: createTestStore() },
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
    },
  ],
  total_pages: 1,
  total_results: 1,
};

describe('MoviesListScreen', () => {
  beforeEach(() => {
    jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows a loading state while the initial request is in flight', () => {
    jest.mocked(globalThis.fetch).mockImplementation(() => new Promise(() => {}));

    const { getByText } = renderMoviesListScreen();

    expect(getByText('Loading…')).toBeTruthy();
  });

  it('shows the movie list once the request resolves', async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue(jsonResponse(POPULAR_MOVIES_RESPONSE));

    const { getByText } = renderMoviesListScreen();

    await waitFor(() => expect(getByText('Fight Club')).toBeTruthy());
  });

  it('shows the unauthorized error state on a 401 response', async () => {
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValue(
        jsonResponse({ status_code: 7, status_message: 'Invalid API key', success: false }, 401),
      );

    const { getByText } = renderMoviesListScreen();

    await waitFor(() => expect(getByText('Check your TMDB API key in the .env file')).toBeTruthy());
  });

  it('shows the empty state when the response has no results', async () => {
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValue(
        jsonResponse({ ...POPULAR_MOVIES_RESPONSE, results: [], total_results: 0 }),
      );

    const { getByText } = renderMoviesListScreen();

    await waitFor(() => expect(getByText('No results')).toBeTruthy());
  });

  it('searches by query text once the debounce settles', async () => {
    // A Response body can only be read once — mockResolvedValue would reuse
    // the same instance for both the initial and the search request, so this
    // returns a fresh Response per call instead.
    jest
      .mocked(globalThis.fetch)
      .mockImplementation(async () => jsonResponse(POPULAR_MOVIES_RESPONSE));

    // The search bar only renders once the initial (non-search) list request
    // has resolved — ListTemplate shows LoadingState until then.
    const { findByPlaceholderText } = renderMoviesListScreen();
    const searchInput = await findByPlaceholderText('Search…');

    fireEvent.changeText(searchInput, 'fight');

    await waitFor(() => {
      // fetchBaseQuery calls fetch() with a Request object, not a plain URL
      // string — String(request) gives "[object Request]", so read .url.
      const searchCall = jest
        .mocked(globalThis.fetch)
        .mock.calls.find(
          ([input]) => input instanceof Request && input.url.includes('/search/movie'),
        );
      expect(searchCall).toBeTruthy();
    });
  });
});
