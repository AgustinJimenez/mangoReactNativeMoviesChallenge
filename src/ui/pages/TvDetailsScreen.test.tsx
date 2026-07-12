import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { waitFor } from '@testing-library/react-native';

import { ROUTES } from '@/navigation/routes';
import type { RootStackParamList } from '@/navigation/types';
import { createTestStore, renderWithProviders } from '@/testUtils';
import { TvDetailsScreen } from '@/ui/pages/TvDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const renderTvDetailsScreen = () =>
  renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name={ROUTES.TV_DETAILS}
          component={TvDetailsScreen}
          initialParams={{ id: 1399 }}
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

const TV_DETAILS_RESPONSE = {
  id: 1399,
  name: 'Game of Thrones',
  poster_path: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
  vote_average: 8.4,
  vote_count: 21000,
  overview: 'Nine noble families fight for control of the mythical land of Westeros...',
  genres: [
    { id: 18, name: 'Drama' },
    { id: 10765, name: 'Sci-Fi & Fantasy' },
  ],
  first_air_date: '2011-04-17',
  backdrop_path: '/got-backdrop.jpg',
  episode_run_time: [60],
  credits: { cast: [] },
  videos: { results: [] },
  recommendations: { page: 1, results: [], total_pages: 1, total_results: 0 },
  content_ratings: {
    results: [{ iso_3166_1: 'US', rating: 'TV-MA' }],
  },
};

describe('TvDetailsScreen', () => {
  beforeEach(() => {
    jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows the details skeleton while the request is in flight', () => {
    jest.mocked(globalThis.fetch).mockImplementation(() => new Promise(() => {}));

    const { getByLabelText } = renderTvDetailsScreen();

    expect(getByLabelText('Loading…')).toBeTruthy();
  });

  it('shows the tv show details once the request resolves', async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue(jsonResponse(TV_DETAILS_RESPONSE));

    const { getByText } = renderTvDetailsScreen();

    await waitFor(() => expect(getByText('Game of Thrones')).toBeTruthy());
    expect(getByText('TV-MA')).toBeTruthy();
  });

  it('shows the unauthorized error state on a 401 response', async () => {
    jest
      .mocked(globalThis.fetch)
      .mockResolvedValue(
        jsonResponse({ status_code: 7, status_message: 'Invalid API key', success: false }, 401),
      );

    const { getByText } = renderTvDetailsScreen();

    await waitFor(() => expect(getByText('Check your TMDB API key in the .env file')).toBeTruthy());
  });
});
