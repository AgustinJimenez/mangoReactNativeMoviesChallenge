import { waitFor } from '@testing-library/react-native';

import type { FavoriteEntry } from '@/store/favoritesSlice';
import { renderWithProviders } from '@/testUtils';
import { FavoriteEntryItem } from '@/ui/organisms/FavoriteEntryItem';

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
  overview: 'A ticking-time-bomb insomniac...',
  genres: [],
  release_date: '1999-10-15',
  backdrop_path: null,
  runtime: 139,
  credits: { cast: [] },
  videos: { results: [] },
  recommendations: { page: 1, results: [], total_pages: 1, total_results: 0 },
  release_dates: { results: [] },
};

const ENTRY: FavoriteEntry = { id: 550, mediaType: 'movie' };

describe('FavoriteEntryItem', () => {
  beforeEach(() => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(MOVIE_DETAILS_RESPONSE));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders nothing until the media resolves', () => {
    const { toJSON } = renderWithProviders(<FavoriteEntryItem entry={ENTRY} onPress={() => {}} />);

    expect(toJSON()).toBeNull();
  });

  it('renders the resolved media once the query completes', async () => {
    const { findByText } = renderWithProviders(
      <FavoriteEntryItem entry={ENTRY} onPress={() => {}} />,
    );

    expect(await findByText('Fight Club')).toBeTruthy();
  });

  it('renders nothing (not an error row) when the favorited title fails to resolve — e.g. deleted from TMDB', async () => {
    jest.mocked(globalThis.fetch).mockResolvedValue(
      jsonResponse(
        {
          status_code: 34,
          status_message: 'The resource you requested could not be found.',
          success: false,
        },
        404,
      ),
    );

    const { toJSON, store } = renderWithProviders(
      <FavoriteEntryItem entry={ENTRY} onPress={() => {}} />,
    );

    // toJSON() is null both while loading and once genuinely failed, so
    // this waits for the query to actually settle as rejected (via store
    // state directly) before asserting — otherwise a false pass could just
    // be catching the loading state instead of proving the failure path.
    await waitFor(() => {
      const queries = Object.values(store.getState().api.queries);
      expect(queries.some((query) => query?.status === 'rejected')).toBe(true);
    });

    expect(toJSON()).toBeNull();
  });
});
