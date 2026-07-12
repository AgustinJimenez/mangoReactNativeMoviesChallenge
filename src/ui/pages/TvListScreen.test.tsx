import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { waitFor } from '@testing-library/react-native';

import { ROUTES } from '@/navigation/routes';
import type { RootStackParamList } from '@/navigation/types';
import { createTestStore, renderWithProviders } from '@/testUtils';
import { TvListScreen } from '@/ui/pages/TvListScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const renderTvListScreen = () =>
  renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name={ROUTES.TV_LIST} component={TvListScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
    { store: createTestStore() },
  );

const jsonResponse = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });

const POPULAR_TV_RESPONSE = {
  page: 1,
  results: [
    {
      id: 1399,
      name: 'Game of Thrones',
      poster_path: '/poster.jpg',
      vote_average: 8.4,
      vote_count: 21000,
      overview: 'Seven noble families fight for control...',
      genre_ids: [18],
    },
  ],
  total_pages: 1,
  total_results: 1,
};

describe('TvListScreen', () => {
  beforeEach(() => {
    jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows a loading state while the initial request is in flight', () => {
    jest.mocked(globalThis.fetch).mockImplementation(() => new Promise(() => {}));

    const { getByText } = renderTvListScreen();

    expect(getByText('Loading…')).toBeTruthy();
  });

  it('shows the tv show list once the request resolves', async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue(jsonResponse(POPULAR_TV_RESPONSE));

    const { getByText } = renderTvListScreen();

    await waitFor(() => expect(getByText('Game of Thrones')).toBeTruthy());
  });
});
