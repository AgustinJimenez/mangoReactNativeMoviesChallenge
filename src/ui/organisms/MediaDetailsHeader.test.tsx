import { renderWithProviders } from '@/testUtils';
import type { MediaDetails } from '@/types/media';
import { MediaDetailsHeader } from '@/ui/organisms/MediaDetailsHeader';

const MOVIE_DETAILS: MediaDetails = {
  id: 550,
  mediaType: 'movie',
  title: 'Fight Club',
  posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  backdropPath: '/backdrop.jpg',
  voteAverage: 8.4,
  voteCount: 26000,
  overview: 'A ticking-time-bomb insomniac...',
  genreIds: [18, 53],
  genres: [
    { id: 18, name: 'Drama' },
    { id: 53, name: 'Thriller' },
  ],
  releaseDate: '1999-10-15',
  runtimeMinutes: 139,
  cast: [],
  trailerKey: null,
  recommendations: [],
  certification: 'R',
};

describe('MediaDetailsHeader', () => {
  it('renders the title, release date, runtime, and rating', () => {
    const { getByText } = renderWithProviders(<MediaDetailsHeader media={MOVIE_DETAILS} />);

    expect(getByText('Fight Club')).toBeTruthy();
    expect(getByText('1999-10-15')).toBeTruthy();
    expect(getByText('• 2h 19m')).toBeTruthy();
    expect(getByText('8.4')).toBeTruthy();
  });

  it('renders genre badges', () => {
    const { getByText } = renderWithProviders(<MediaDetailsHeader media={MOVIE_DETAILS} />);

    expect(getByText('Drama')).toBeTruthy();
    expect(getByText('Thriller')).toBeTruthy();
  });

  it('omits the runtime segment when runtimeMinutes is null', () => {
    const { queryByText } = renderWithProviders(
      <MediaDetailsHeader media={{ ...MOVIE_DETAILS, runtimeMinutes: null }} />,
    );

    expect(queryByText(/2h 19m/)).toBeNull();
  });

  it('shows "No votes" instead of a score when voteCount is 0', () => {
    const { getByText } = renderWithProviders(
      <MediaDetailsHeader media={{ ...MOVIE_DETAILS, voteCount: 0 }} />,
    );

    expect(getByText('No votes')).toBeTruthy();
  });

  it('renders the certification badge when present', () => {
    const { getByText } = renderWithProviders(<MediaDetailsHeader media={MOVIE_DETAILS} />);

    expect(getByText('R')).toBeTruthy();
  });

  it('omits the certification badge when null', () => {
    const { queryByText } = renderWithProviders(
      <MediaDetailsHeader media={{ ...MOVIE_DETAILS, certification: null }} />,
    );

    expect(queryByText('R')).toBeNull();
  });
});
