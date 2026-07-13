import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { waitFor } from '@testing-library/react-native';

import { ROUTES } from '@/navigation/routes';
import type { RootStackParamList } from '@/navigation/types';
import { createTestStore, renderWithProviders } from '@/testUtils';
import { MovieDetailsScreen } from '@/ui/pages/MovieDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Mirrors MoviesListScreen.test.tsx's renderMoviesListScreen — MovieDetailsScreen
// needs both useRoute() (for params.id) and useNavigation(), which only resolve
// inside a real Screen/Navigator context.
const renderMovieDetailsScreen = () =>
  renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={ROUTES.MOVIE_DETAILS}
          component={MovieDetailsScreen}
          initialParams={{ id: 550 }}
        />
      </Stack.Navigator>
    </NavigationContainer>,
    { store: createTestStore() },
  );

const jsonResponse = (body: unknown, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const MOVIE_DETAILS_RESPONSE = {
  id: 550,
  title: 'Fight Club',
  poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  vote_average: 8.4,
  vote_count: 26000,
  overview: 'A ticking-time-bomb insomniac and a slippery soap salesman...',
  genres: [
    { id: 18, name: 'Drama' },
    { id: 53, name: 'Thriller' },
  ],
  release_date: '1999-10-15',
  backdrop_path: '/backdrop.jpg',
  runtime: 139,
  credits: {
    cast: [{ id: 819, name: 'Edward Norton', character: 'The Narrator', profile_path: null }],
  },
  videos: { results: [] },
  recommendations: { page: 1, results: [], total_pages: 1, total_results: 0 },
  release_dates: {
    results: [{ iso_3166_1: 'US', release_dates: [{ certification: 'R' }] }],
  },
};

describe('MovieDetailsScreen', () => {
  beforeEach(() => {
    jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the details skeleton while the request is in flight', () => {
    jest.mocked(globalThis.fetch).mockImplementation(() => new Promise(() => {}));

    const { getByLabelText } = renderMovieDetailsScreen();

    expect(getByLabelText('Loading…')).toBeTruthy();
  });

  it('shows the movie details once the request resolves', async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue(jsonResponse(MOVIE_DETAILS_RESPONSE));

    const { getByText } = renderMovieDetailsScreen();

    await waitFor(() => expect(getByText('Fight Club')).toBeTruthy());
    expect(getByText('R')).toBeTruthy();
    expect(getByText('Edward Norton')).toBeTruthy();
  });

  it('shows the unauthorized error state on a 401 response', async () => {
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValue(
        jsonResponse({ status_code: 7, status_message: 'Invalid API key', success: false }, 401),
      );

    const { getByText } = renderMovieDetailsScreen();

    await waitFor(() => expect(getByText('Check your TMDB API key in the .env file')).toBeTruthy());
  });

  it('shows the generic error state instead of crashing on a 200 response with a null body', async () => {
    // A flaky connection can occasionally resolve a request with a 200
    // status and a null body instead of a proper network error — without
    // isValidTmdbResponse rejecting it, movieDetailsToMediaDetails's very
    // first field access (movie.id) throws on the null body.
    jest.mocked(globalThis.fetch).mockResolvedValue(jsonResponse(null));

    const { getByText } = renderMovieDetailsScreen();

    await waitFor(() => expect(getByText("We couldn't load this content")).toBeTruthy());
  });
});
