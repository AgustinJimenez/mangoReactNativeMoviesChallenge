import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ROUTES } from '@/navigation/routes';
import type { RootStackParamList } from '@/navigation/types';
import { toggleFavorite } from '@/store/favoritesSlice';
import { createTestStore, renderWithProviders } from '@/testUtils';
import { FavoritesScreen } from '@/ui/pages/FavoritesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const renderFavoritesScreen = (store: ReturnType<typeof createTestStore>) =>
  renderWithProviders(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name={ROUTES.FAVORITES_LIST} component={FavoritesScreen} />
      </Stack.Navigator>
    </NavigationContainer>,
    { store },
  );

describe('FavoritesScreen', () => {
  it('shows the empty message when there are no favorites', () => {
    const { getByText } = renderFavoritesScreen(createTestStore());

    expect(getByText("You don't have any favorites yet")).toBeTruthy();
  });

  it('renders a favorited title once its details resolve', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 550,
          title: 'Fight Club',
          poster_path: null,
          vote_average: 8.4,
          vote_count: 26000,
          overview: '',
          genres: [],
          release_date: '',
          backdrop_path: null,
          runtime: null,
          credits: { cast: [] },
          videos: { results: [] },
          recommendations: { page: 1, results: [], total_pages: 1, total_results: 0 },
          release_dates: { results: [] },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    const store = createTestStore();
    store.dispatch(toggleFavorite({ id: 550, mediaType: 'movie' }));

    const { findByText } = renderFavoritesScreen(store);

    expect(await findByText('Fight Club')).toBeTruthy();
    jest.restoreAllMocks();
  });
});
