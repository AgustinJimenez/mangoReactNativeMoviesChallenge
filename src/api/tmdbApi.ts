import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { env } from '@/config/env';
import { toTmdbLanguage, toTmdbRegion } from '@/i18n/tmdbLocale';
import type { Locale, PaginatedResponse } from '@/types/common';
import type { CastMember, Genre, Media, MediaDetails } from '@/types/media';

// Raw TMDB response shapes (snake_case). Normalized to Media/MediaDetails
// below before leaving the api layer; exported (alongside the normalizers
// themselves) only so tests can exercise the normalization directly instead
// of going through a mocked fetch + the full RTK Query request lifecycle.
//
// Summary (list/search) and details shapes both carry the same core fields,
// but diverge on genres: summaries only return `genre_ids` (numbers),
// details return full `{ id, name }` objects — two different response
// shapes, not one extending the other.
export type TmdbGenre = {
  id: number;
  name: string;
};

type TmdbMovieCore = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  overview: string;
};

type TmdbTvCore = {
  id: number;
  name: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
  overview: string;
};

export type TmdbMovieSummary = TmdbMovieCore & {
  genre_ids: number[];
};

export type TmdbTvSummary = TmdbTvCore & {
  genre_ids: number[];
};

// Requested via append_to_response=credits,videos,recommendations on the
// details call itself (one HTTP request, not three) — see getMovieDetails.
type TmdbCastMember = {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
};

type TmdbCredits = {
  cast: TmdbCastMember[];
};

type TmdbVideo = {
  key: string;
  site: string;
  type: string;
  official: boolean;
};

type TmdbVideos = {
  results: TmdbVideo[];
};

// Requested via append_to_response=release_dates on the movie details call.
// Certifications are per-country (the same movie can be "R" in the US and
// "18" in Spain) — one entry per country, each with its own list of
// releases (theatrical, digital, Blu-ray...), not one certification per
// movie. See findMovieCertification.
type TmdbReleaseDateEntry = {
  certification: string;
};

type TmdbReleaseDatesResult = {
  iso_3166_1: string;
  release_dates: TmdbReleaseDateEntry[];
};

type TmdbReleaseDates = {
  results: TmdbReleaseDatesResult[];
};

// Requested via append_to_response=content_ratings on the tv details call —
// TV's equivalent of release_dates above, but flat (one rating per
// country instead of a list of releases).
type TmdbContentRatingsResult = {
  iso_3166_1: string;
  rating: string;
};

type TmdbContentRatings = {
  results: TmdbContentRatingsResult[];
};

export type TmdbMovieDetails = TmdbMovieCore & {
  genres: TmdbGenre[];
  release_date: string;
  backdrop_path: string | null;
  runtime: number | null;
  credits: TmdbCredits;
  videos: TmdbVideos;
  recommendations: TmdbPaginatedResponse<TmdbMovieSummary>;
  release_dates: TmdbReleaseDates;
};

export type TmdbTvDetails = TmdbTvCore & {
  genres: TmdbGenre[];
  first_air_date: string;
  backdrop_path: string | null;
  // TMDB has no single tv-wide runtime — episode_run_time is a distribution
  // across episodes (often just one value, sometimes several if it changed
  // over the show's run). tvDetailsToMediaDetails takes the first as a
  // reasonable single-number approximation for display.
  episode_run_time: number[];
  credits: TmdbCredits;
  videos: TmdbVideos;
  recommendations: TmdbPaginatedResponse<TmdbTvSummary>;
  content_ratings: TmdbContentRatings;
};

export type TmdbPaginatedResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

// User-facing sort options for the popular list. TMDB's /discover endpoints
// take a raw sort_by string, and movies/tv use different field names for
// the "newest" option (primary_release_date vs first_air_date) — these maps
// translate the shared SortBy union to each endpoint's actual param.
export type SortBy = 'popularity' | 'rating' | 'newest' | 'title';

const MOVIE_SORT_PARAMS: Record<SortBy, string> = {
  popularity: 'popularity.desc',
  rating: 'vote_average.desc',
  newest: 'primary_release_date.desc',
  title: 'title.asc',
};

const TV_SORT_PARAMS: Record<SortBy, string> = {
  popularity: 'popularity.desc',
  rating: 'vote_average.desc',
  newest: 'first_air_date.desc',
  title: 'name.asc',
};

export const toMovieSortByParam = (sortBy: SortBy): string => MOVIE_SORT_PARAMS[sortBy];
export const toTvSortByParam = (sortBy: SortBy): string => TV_SORT_PARAMS[sortBy];

export const movieToMedia = (movie: TmdbMovieSummary): Media => ({
  id: movie.id,
  mediaType: 'movie',
  title: movie.title,
  posterPath: movie.poster_path,
  voteAverage: movie.vote_average,
  voteCount: movie.vote_count,
  overview: movie.overview,
  genreIds: movie.genre_ids,
});

export const tvToMedia = (tv: TmdbTvSummary): Media => ({
  id: tv.id,
  mediaType: 'tv',
  title: tv.name,
  posterPath: tv.poster_path,
  voteAverage: tv.vote_average,
  voteCount: tv.vote_count,
  overview: tv.overview,
  genreIds: tv.genre_ids,
});

export const toPaginatedMedia = <T>(
  response: TmdbPaginatedResponse<T>,
  toMedia: (item: T) => Media,
): PaginatedResponse<Media> => ({
  page: response.page,
  results: response.results.map(toMedia),
  totalPages: response.total_pages,
  totalResults: response.total_results,
});

// Cast strip on the details page, not a full credits list — see
// CastMember/MediaDetails.cast.
const MAX_CAST_MEMBERS = 10;

const toCastMembers = (credits: TmdbCredits): CastMember[] =>
  credits.cast.slice(0, MAX_CAST_MEMBERS).map((member) => ({
    id: member.id,
    name: member.name,
    character: member.character,
    profilePath: member.profile_path,
  }));

// Prefers an official YouTube trailer, then any YouTube trailer, then
// whatever YouTube video TMDB has (teasers, clips) — falls back that far
// because plenty of titles never get a video explicitly typed "Trailer".
// Non-YouTube sites (Vimeo) are skipped since TrailerSection only knows how
// to build a youtube.com link.
const findTrailerKey = (videos: TmdbVideos): string | null => {
  const youtubeVideos = videos.results.filter((video) => video.site === 'YouTube');
  const officialTrailer = youtubeVideos.find((video) => video.type === 'Trailer' && video.official);
  const anyTrailer = youtubeVideos.find((video) => video.type === 'Trailer');
  return (officialTrailer ?? anyTrailer ?? youtubeVideos[0])?.key ?? null;
};

// Picks the certification for one country (region, e.g. "US"/"ES" — see
// toTmdbRegion) out of release_dates' per-country list. A country can list
// several releases (theatrical, digital, Blu-ray...) with only some
// carrying a certification, so this takes the first non-empty one rather
// than always release_dates[0].
const findMovieCertification = (releaseDates: TmdbReleaseDates, region: string): string | null => {
  const countryResult = releaseDates.results.find((result) => result.iso_3166_1 === region);
  const certified = countryResult?.release_dates.find((entry) => entry.certification !== '');
  return certified?.certification ?? null;
};

const findTvCertification = (contentRatings: TmdbContentRatings, region: string): string | null => {
  const countryResult = contentRatings.results.find((result) => result.iso_3166_1 === region);
  return countryResult?.rating || null;
};

export const movieDetailsToMediaDetails = (
  movie: TmdbMovieDetails,
  region: string,
): MediaDetails => ({
  id: movie.id,
  mediaType: 'movie',
  title: movie.title,
  posterPath: movie.poster_path,
  backdropPath: movie.backdrop_path,
  voteAverage: movie.vote_average,
  voteCount: movie.vote_count,
  overview: movie.overview,
  // Derived from the full genre objects below rather than a separate
  // lookup — MediaDetails always has real genre names already, unlike
  // list/search summaries which only have IDs.
  genreIds: movie.genres.map((genre) => genre.id),
  genres: movie.genres.map((genre): Genre => ({ id: genre.id, name: genre.name })),
  releaseDate: movie.release_date,
  runtimeMinutes: movie.runtime,
  cast: toCastMembers(movie.credits),
  trailerKey: findTrailerKey(movie.videos),
  recommendations: toPaginatedMedia(movie.recommendations, movieToMedia).results,
  certification: findMovieCertification(movie.release_dates, region),
});

export const tvDetailsToMediaDetails = (tv: TmdbTvDetails, region: string): MediaDetails => ({
  id: tv.id,
  mediaType: 'tv',
  title: tv.name,
  posterPath: tv.poster_path,
  backdropPath: tv.backdrop_path,
  voteAverage: tv.vote_average,
  voteCount: tv.vote_count,
  overview: tv.overview,
  genreIds: tv.genres.map((genre) => genre.id),
  genres: tv.genres.map((genre): Genre => ({ id: genre.id, name: genre.name })),
  releaseDate: tv.first_air_date,
  runtimeMinutes: tv.episode_run_time[0] ?? null,
  cast: toCastMembers(tv.credits),
  trailerKey: findTrailerKey(tv.videos),
  recommendations: toPaginatedMedia(tv.recommendations, tvToMedia).results,
  certification: findTvCertification(tv.content_ratings, region),
});

// Shared `merge` for every paginated list/search endpoint below. TMDB's
// ranking can shift slightly between page fetches (more so once sort_by/
// with_genres are in play on /discover — see getPopularMovies) — the same
// item can land on two different pages, which without de-duping produces
// duplicate ids in one FlatList's data and React's "two children with the
// same key" warning. Dedupes by id, safe because within a single query
// every item shares the same mediaType (movie XOR tv, never mixed).
export const mergePaginatedResults = (
  currentCache: PaginatedResponse<Media>,
  newResponse: PaginatedResponse<Media>,
): PaginatedResponse<Media> | undefined => {
  if (newResponse.page === 1) {
    return newResponse;
  }
  const existingIds = new Set(currentCache.results.map((item) => item.id));
  const newItems = newResponse.results.filter((item) => !existingIds.has(item.id));
  currentCache.results.push(...newItems);
  currentCache.page = newResponse.page;
  return undefined;
};

type MediaListArgs = {
  page: number;
  language: Locale;
  // Optional genre filter (TMDB genre id) and sort order — both go through
  // to /discover, not /popular. Neither applies to search below: TMDB's
  // /search/movie and /search/tv endpoints don't accept with_genres or
  // sort_by, only query/page/language, so searchMovies/searchTv ignore
  // these two fields even though MediaSearchArgs technically carries them.
  genreId?: number;
  sortBy?: SortBy;
};

type MediaSearchArgs = MediaListArgs & {
  query: string;
};

type MediaDetailsArgs = {
  id: number;
  language: Locale;
};

// Seconds a cached entry can be reused as-is (instant render, no network)
// before a component remounting with the same query args triggers a
// background refetch. Without this, redux-persist's rehydrated cache (see
// store/index.ts) would be shown forever with no revalidation — closing
// and reopening the app, or navigating back to an already-viewed
// list/details screen, would keep serving whatever was fetched the very
// first time, however old. 5 minutes is generous enough that normal
// back-and-forth navigation within a session never re-fetches, but still
// catches "came back to the app later" the way redux-persist is meant to.
const REFETCH_STALE_AFTER_SECONDS = 300;

// A flaky connection (network drops mid-request, then the fetch resolves
// anyway) can occasionally yield a 200 response with a null body instead of
// a proper network error. Without rejecting it here, that null body reaches
// transformResponse as-is — movieDetailsToMediaDetails/tvDetailsToMediaDetails's
// very first field access (`movie.id`) then throws, which RTK Query logs as
// an "unhandled error" and surfaces a much less useful message than the
// normal FETCH_ERROR/isError path every screen already renders ErrorState/
// the stale-data notice for. Exported for direct testing — see tmdbApi.test.ts.
const HTTP_OK_MIN = 200;
const HTTP_OK_MAX = 299;

export const isValidTmdbResponse = (response: Response, body: unknown): boolean =>
  response.status >= HTTP_OK_MIN && response.status <= HTTP_OK_MAX && body != null;

export const api = createApi({
  reducerPath: 'api',
  refetchOnMountOrArgChange: REFETCH_STALE_AFTER_SECONDS,
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.themoviedb.org/3',
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Bearer ${env.tmdbAccessToken}`);
      return headers;
    },
    validateStatus: isValidTmdbResponse,
  }),
  endpoints: (builder) => ({
    getPopularMovies: builder.query<PaginatedResponse<Media>, MediaListArgs>({
      // /discover/movie instead of /movie/popular — the latter is "really
      // just a discover call behind the scenes" per TMDB's own docs, but
      // locked to fixed params with no with_genres/sort_by support. Default
      // sort_by matches /movie/popular's own default (popularity.desc), so
      // this is a no-op change until a caller passes genreId/sortBy.
      query: ({ page, language, genreId, sortBy = 'popularity' }) => ({
        url: '/discover/movie',
        params: {
          page,
          language: toTmdbLanguage(language),
          include_adult: false,
          sort_by: toMovieSortByParam(sortBy),
          ...(genreId ? { with_genres: genreId } : {}),
        },
      }),
      transformResponse: (response: TmdbPaginatedResponse<TmdbMovieSummary>) =>
        toPaginatedMedia(response, movieToMedia),
      serializeQueryArgs: ({ queryArgs }) => ({
        language: queryArgs.language,
        genreId: queryArgs.genreId,
        sortBy: queryArgs.sortBy,
      }),
      merge: mergePaginatedResults,
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),

    searchMovies: builder.query<PaginatedResponse<Media>, MediaSearchArgs>({
      query: ({ query, page, language }) => ({
        url: '/search/movie',
        params: { query, page, language: toTmdbLanguage(language), include_adult: false },
      }),
      transformResponse: (response: TmdbPaginatedResponse<TmdbMovieSummary>) =>
        toPaginatedMedia(response, movieToMedia),
      serializeQueryArgs: ({ queryArgs }) => ({
        language: queryArgs.language,
        query: queryArgs.query,
      }),
      merge: mergePaginatedResults,
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),

    getMovieDetails: builder.query<MediaDetails, MediaDetailsArgs>({
      // append_to_response bundles cast/videos/recommendations/release_dates
      // into this same request instead of four separate round trips.
      query: ({ id, language }) => ({
        url: `/movie/${id}`,
        params: {
          language: toTmdbLanguage(language),
          append_to_response: 'credits,videos,recommendations,release_dates',
        },
      }),
      transformResponse: (movie: TmdbMovieDetails, _meta, { language }) =>
        movieDetailsToMediaDetails(movie, toTmdbRegion(language)),
    }),

    getPopularTv: builder.query<PaginatedResponse<Media>, MediaListArgs>({
      // See getPopularMovies above — same /discover swap, same reasoning.
      query: ({ page, language, genreId, sortBy = 'popularity' }) => ({
        url: '/discover/tv',
        params: {
          page,
          language: toTmdbLanguage(language),
          include_adult: false,
          sort_by: toTvSortByParam(sortBy),
          ...(genreId ? { with_genres: genreId } : {}),
        },
      }),
      transformResponse: (response: TmdbPaginatedResponse<TmdbTvSummary>) =>
        toPaginatedMedia(response, tvToMedia),
      serializeQueryArgs: ({ queryArgs }) => ({
        language: queryArgs.language,
        genreId: queryArgs.genreId,
        sortBy: queryArgs.sortBy,
      }),
      merge: mergePaginatedResults,
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),

    searchTv: builder.query<PaginatedResponse<Media>, MediaSearchArgs>({
      query: ({ query, page, language }) => ({
        url: '/search/tv',
        params: { query, page, language: toTmdbLanguage(language), include_adult: false },
      }),
      transformResponse: (response: TmdbPaginatedResponse<TmdbTvSummary>) =>
        toPaginatedMedia(response, tvToMedia),
      serializeQueryArgs: ({ queryArgs }) => ({
        language: queryArgs.language,
        query: queryArgs.query,
      }),
      merge: mergePaginatedResults,
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),

    getTvDetails: builder.query<MediaDetails, MediaDetailsArgs>({
      // See getMovieDetails above — same append_to_response reasoning
      // (content_ratings is tv's equivalent of movie's release_dates).
      query: ({ id, language }) => ({
        url: `/tv/${id}`,
        params: {
          language: toTmdbLanguage(language),
          append_to_response: 'credits,videos,recommendations,content_ratings',
        },
      }),
      transformResponse: (tv: TmdbTvDetails, _meta, { language }) =>
        tvDetailsToMediaDetails(tv, toTmdbRegion(language)),
    }),
  }),
});

export const {
  useGetPopularMoviesQuery,
  useSearchMoviesQuery,
  useGetMovieDetailsQuery,
  useGetPopularTvQuery,
  useSearchTvQuery,
  useGetTvDetailsQuery,
} = api;
