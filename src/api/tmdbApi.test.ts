import { movieToMedia, toMediaDetails, toPaginatedMedia, tvToMedia } from '@/api/tmdbApi';
import type { TmdbMovieSummary, TmdbPaginatedResponse, TmdbTvSummary } from '@/api/tmdbApi';

const MOVIE: TmdbMovieSummary = {
  id: 550,
  title: 'Fight Club',
  poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  vote_average: 8.4,
  vote_count: 26000,
};

const TV_SHOW: TmdbTvSummary = {
  id: 1399,
  name: 'Game of Thrones',
  poster_path: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
  vote_average: 8.4,
  vote_count: 21000,
};

describe('movieToMedia', () => {
  it('normalizes a TMDB movie summary into Media', () => {
    expect(movieToMedia(MOVIE)).toEqual({
      id: 550,
      mediaType: 'movie',
      title: 'Fight Club',
      posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      voteAverage: 8.4,
      voteCount: 26000,
    });
  });

  it('carries a null poster_path through as null (no fallback here)', () => {
    expect(movieToMedia({ ...MOVIE, poster_path: null }).posterPath).toBeNull();
  });
});

describe('tvToMedia', () => {
  it('normalizes a TMDB tv summary into Media, mapping name to title', () => {
    expect(tvToMedia(TV_SHOW)).toEqual({
      id: 1399,
      mediaType: 'tv',
      title: 'Game of Thrones',
      posterPath: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
      voteAverage: 8.4,
      voteCount: 21000,
    });
  });
});

describe('toMediaDetails', () => {
  it('merges a normalized Media with overview/releaseDate/genres', () => {
    const media = movieToMedia(MOVIE);
    const genres = [
      { id: 18, name: 'Drama' },
      { id: 53, name: 'Thriller' },
    ];

    expect(toMediaDetails(media, 'A ticking-time-bomb insomniac...', genres, '1999-10-15')).toEqual(
      {
        ...media,
        overview: 'A ticking-time-bomb insomniac...',
        releaseDate: '1999-10-15',
        genres,
      },
    );
  });
});

describe('toPaginatedMedia', () => {
  it('normalizes a paginated TMDB response, mapping snake_case pagination fields', () => {
    const response: TmdbPaginatedResponse<TmdbMovieSummary> = {
      page: 2,
      results: [MOVIE],
      total_pages: 10,
      total_results: 200,
    };

    expect(toPaginatedMedia(response, movieToMedia)).toEqual({
      page: 2,
      results: [movieToMedia(MOVIE)],
      totalPages: 10,
      totalResults: 200,
    });
  });

  it('maps every item in results through the given normalizer', () => {
    const response: TmdbPaginatedResponse<TmdbMovieSummary> = {
      page: 1,
      results: [MOVIE, { ...MOVIE, id: 551, title: 'Se7en' }],
      total_pages: 1,
      total_results: 2,
    };

    expect(toPaginatedMedia(response, movieToMedia).results).toHaveLength(2);
  });
});
