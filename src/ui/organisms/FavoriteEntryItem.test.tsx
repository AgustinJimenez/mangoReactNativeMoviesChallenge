import type { FavoriteEntry } from '@/store/favoritesSlice';
import { renderWithProviders } from '@/testUtils';
import { FavoriteEntryItem } from '@/ui/organisms/FavoriteEntryItem';

const jsonResponse = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
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
});
