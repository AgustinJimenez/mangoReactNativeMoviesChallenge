import {
  mergePaginatedResults,
  movieDetailsToMediaDetails,
  movieToMedia,
  toMovieSortByParam,
  toPaginatedMedia,
  toTvSortByParam,
  tvDetailsToMediaDetails,
  tvToMedia,
} from '@/api/tmdbApi';
import type {
  SortBy,
  TmdbMovieDetails,
  TmdbMovieSummary,
  TmdbPaginatedResponse,
  TmdbTvDetails,
  TmdbTvSummary,
} from '@/api/tmdbApi';
import type { PaginatedResponse } from '@/types/common';
import type { Media } from '@/types/media';

const MOVIE: TmdbMovieSummary = {
  id: 550,
  title: 'Fight Club',
  poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  vote_average: 8.4,
  vote_count: 26000,
  overview: 'A ticking-time-bomb insomniac...',
  genre_ids: [18, 53],
};

const TV_SHOW: TmdbTvSummary = {
  id: 1399,
  name: 'Game of Thrones',
  poster_path: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
  vote_average: 8.4,
  vote_count: 21000,
  overview: 'Nine noble families fight for control...',
  genre_ids: [18, 10765],
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
      overview: 'A ticking-time-bomb insomniac...',
      genreIds: [18, 53],
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
      overview: 'Nine noble families fight for control...',
      genreIds: [18, 10765],
    });
  });
});

const MOVIE_DETAILS: TmdbMovieDetails = {
  id: 550,
  title: 'Fight Club',
  poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  vote_average: 8.4,
  vote_count: 26000,
  overview: 'A ticking-time-bomb insomniac...',
  genres: [
    { id: 18, name: 'Drama' },
    { id: 53, name: 'Thriller' },
  ],
  release_date: '1999-10-15',
  backdrop_path: '/backdrop.jpg',
  runtime: 139,
  credits: {
    cast: [
      { id: 1, name: 'Edward Norton', character: 'The Narrator', profile_path: '/norton.jpg' },
      { id: 2, name: 'Brad Pitt', character: 'Tyler Durden', profile_path: null },
    ],
  },
  videos: {
    results: [{ key: 'abc123', site: 'YouTube', type: 'Trailer', official: true }],
  },
  recommendations: {
    page: 1,
    results: [{ ...MOVIE, id: 551, title: 'Se7en' }],
    total_pages: 1,
    total_results: 1,
  },
  release_dates: {
    results: [
      {
        iso_3166_1: 'US',
        release_dates: [{ certification: '' }, { certification: 'R' }],
      },
      { iso_3166_1: 'ES', release_dates: [{ certification: '18' }] },
    ],
  },
};

describe('movieDetailsToMediaDetails', () => {
  it('builds MediaDetails from a movie details response, including cast/trailer/recommendations', () => {
    expect(movieDetailsToMediaDetails(MOVIE_DETAILS, 'US')).toEqual({
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
      cast: [
        { id: 1, name: 'Edward Norton', character: 'The Narrator', profilePath: '/norton.jpg' },
        { id: 2, name: 'Brad Pitt', character: 'Tyler Durden', profilePath: null },
      ],
      trailerKey: 'abc123',
      recommendations: [movieToMedia({ ...MOVIE, id: 551, title: 'Se7en' })],
      certification: 'R',
    });
  });

  it('caps cast at 10 members', () => {
    const manyCast = Array.from({ length: 15 }, (_, index) => ({
      id: index,
      name: `Actor ${index}`,
      character: `Role ${index}`,
      profile_path: null,
    }));

    const details = { ...MOVIE_DETAILS, credits: { cast: manyCast } };

    expect(movieDetailsToMediaDetails(details, 'US').cast).toHaveLength(10);
  });

  it('prefers an official YouTube trailer over other videos', () => {
    const details = {
      ...MOVIE_DETAILS,
      videos: {
        results: [
          { key: 'teaser', site: 'YouTube', type: 'Teaser', official: true },
          { key: 'unofficial', site: 'YouTube', type: 'Trailer', official: false },
          { key: 'official', site: 'YouTube', type: 'Trailer', official: true },
        ],
      },
    };

    expect(movieDetailsToMediaDetails(details, 'US').trailerKey).toBe('official');
  });

  it('returns a null trailerKey when there are no YouTube videos', () => {
    const details = {
      ...MOVIE_DETAILS,
      videos: { results: [{ key: 'x', site: 'Vimeo', type: 'Trailer', official: true }] },
    };

    expect(movieDetailsToMediaDetails(details, 'US').trailerKey).toBeNull();
  });

  it('picks the certification matching the given region', () => {
    expect(movieDetailsToMediaDetails(MOVIE_DETAILS, 'ES').certification).toBe('18');
  });

  it('returns a null certification when the region has no release_dates entry', () => {
    expect(movieDetailsToMediaDetails(MOVIE_DETAILS, 'FR').certification).toBeNull();
  });
});

const TV_DETAILS: TmdbTvDetails = {
  id: 1399,
  name: 'Game of Thrones',
  poster_path: '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg',
  vote_average: 8.4,
  vote_count: 21000,
  overview: 'Nine noble families fight for control...',
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
    results: [
      { iso_3166_1: 'US', rating: 'TV-MA' },
      { iso_3166_1: 'ES', rating: '16' },
    ],
  },
};

describe('tvDetailsToMediaDetails', () => {
  it('builds MediaDetails from a tv details response, mapping name/first_air_date', () => {
    const result = tvDetailsToMediaDetails(TV_DETAILS, 'US');

    expect(result.mediaType).toBe('tv');
    expect(result.title).toBe('Game of Thrones');
    expect(result.releaseDate).toBe('2011-04-17');
    expect(result.runtimeMinutes).toBe(60);
    expect(result.certification).toBe('TV-MA');
  });

  it('takes the first episode_run_time value as runtimeMinutes', () => {
    const details = { ...TV_DETAILS, episode_run_time: [42, 45] };

    expect(tvDetailsToMediaDetails(details, 'US').runtimeMinutes).toBe(42);
  });

  it('falls back to a null runtimeMinutes when episode_run_time is empty', () => {
    const details = { ...TV_DETAILS, episode_run_time: [] };

    expect(tvDetailsToMediaDetails(details, 'US').runtimeMinutes).toBeNull();
  });

  it('picks the certification matching the given region', () => {
    expect(tvDetailsToMediaDetails(TV_DETAILS, 'ES').certification).toBe('16');
  });

  it('returns a null certification when the region has no content_ratings entry', () => {
    expect(tvDetailsToMediaDetails(TV_DETAILS, 'FR').certification).toBeNull();
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

describe('toMovieSortByParam', () => {
  it('maps every SortBy option to a valid TMDB sort_by string', () => {
    expect(toMovieSortByParam('popularity')).toBe('popularity.desc');
    expect(toMovieSortByParam('rating')).toBe('vote_average.desc');
    expect(toMovieSortByParam('newest')).toBe('primary_release_date.desc');
    expect(toMovieSortByParam('title')).toBe('title.asc');
  });
});

describe('toTvSortByParam', () => {
  it('maps every SortBy option to a valid TMDB sort_by string', () => {
    expect(toTvSortByParam('popularity')).toBe('popularity.desc');
    expect(toTvSortByParam('rating')).toBe('vote_average.desc');
    expect(toTvSortByParam('newest')).toBe('first_air_date.desc');
    expect(toTvSortByParam('title')).toBe('name.asc');
  });

  it('uses a tv-specific date field, unlike movies', () => {
    const sortBy: SortBy = 'newest';
    expect(toTvSortByParam(sortBy)).not.toBe(toMovieSortByParam(sortBy));
  });
});

describe('mergePaginatedResults', () => {
  const media = (id: number): Media => ({ ...movieToMedia(MOVIE), id });

  it('replaces the cache outright on page 1 (a fresh filter/sort/search)', () => {
    const currentCache: PaginatedResponse<Media> = {
      page: 3,
      results: [media(1), media(2)],
      totalPages: 5,
      totalResults: 100,
    };
    const newResponse: PaginatedResponse<Media> = {
      page: 1,
      results: [media(9)],
      totalPages: 5,
      totalResults: 100,
    };

    expect(mergePaginatedResults(currentCache, newResponse)).toEqual(newResponse);
  });

  it('appends new pages to the existing cache', () => {
    const currentCache: PaginatedResponse<Media> = {
      page: 1,
      results: [media(1), media(2)],
      totalPages: 5,
      totalResults: 100,
    };
    const newResponse: PaginatedResponse<Media> = {
      page: 2,
      results: [media(3), media(4)],
      totalPages: 5,
      totalResults: 100,
    };

    mergePaginatedResults(currentCache, newResponse);

    expect(currentCache.results.map((item) => item.id)).toEqual([1, 2, 3, 4]);
    expect(currentCache.page).toBe(2);
  });

  it('drops items already present instead of duplicating them', () => {
    // TMDB's ranking can shift between page fetches (especially once
    // sort_by/with_genres are in play), so the same item can come back on
    // a later page — without this, MediaListItem's FlatList would render
    // two rows with the same id/key.
    const currentCache: PaginatedResponse<Media> = {
      page: 1,
      results: [media(1), media(2)],
      totalPages: 5,
      totalResults: 100,
    };
    const newResponse: PaginatedResponse<Media> = {
      page: 2,
      results: [media(2), media(3)],
      totalPages: 5,
      totalResults: 100,
    };

    mergePaginatedResults(currentCache, newResponse);

    expect(currentCache.results.map((item) => item.id)).toEqual([1, 2, 3]);
  });
});
