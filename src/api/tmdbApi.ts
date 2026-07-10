import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { env } from '@/config/env';
import { toTmdbLanguage } from '@/i18n/tmdbLocale';
import type { Locale, PaginatedResponse } from '@/types/common';
import type { Genre, Media, MediaDetails } from '@/types/media';

// Raw TMDB response shapes (snake_case). Normalized to Media/MediaDetails
// below before leaving the api layer; exported (alongside the normalizers
// themselves) only so tests can exercise the normalization directly instead
// of going through a mocked fetch + the full RTK Query request lifecycle.
export type TmdbGenre = {
  id: number;
  name: string;
};

export type TmdbMovieSummary = {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
};

export type TmdbTvSummary = {
  id: number;
  name: string;
  poster_path: string | null;
  vote_average: number;
  vote_count: number;
};

export type TmdbMovieDetails = TmdbMovieSummary & {
  overview: string;
  genres: TmdbGenre[];
  release_date: string;
};

export type TmdbTvDetails = TmdbTvSummary & {
  overview: string;
  genres: TmdbGenre[];
  first_air_date: string;
};

export type TmdbPaginatedResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

export const movieToMedia = (movie: TmdbMovieSummary): Media => ({
  id: movie.id,
  mediaType: 'movie',
  title: movie.title,
  posterPath: movie.poster_path,
  voteAverage: movie.vote_average,
  voteCount: movie.vote_count,
});

export const tvToMedia = (tv: TmdbTvSummary): Media => ({
  id: tv.id,
  mediaType: 'tv',
  title: tv.name,
  posterPath: tv.poster_path,
  voteAverage: tv.vote_average,
  voteCount: tv.vote_count,
});

export const toMediaDetails = (
  media: Media,
  overview: string,
  genres: TmdbGenre[],
  releaseDate: string,
): MediaDetails => ({
  ...media,
  overview,
  releaseDate,
  genres: genres.map((genre): Genre => ({ id: genre.id, name: genre.name })),
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

type MediaListArgs = {
  page: number;
  language: Locale;
};

type MediaSearchArgs = MediaListArgs & {
  query: string;
};

type MediaDetailsArgs = {
  id: number;
  language: Locale;
};

export const tmdbApi = createApi({
  reducerPath: 'tmdbApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.themoviedb.org/3',
    prepareHeaders: (headers) => {
      headers.set('Authorization', `Bearer ${env.tmdbAccessToken}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getPopularMovies: builder.query<PaginatedResponse<Media>, MediaListArgs>({
      query: ({ page, language }) => ({
        url: '/movie/popular',
        params: { page, language: toTmdbLanguage(language), include_adult: false },
      }),
      transformResponse: (response: TmdbPaginatedResponse<TmdbMovieSummary>) =>
        toPaginatedMedia(response, movieToMedia),
      serializeQueryArgs: ({ queryArgs }) => ({ language: queryArgs.language }),
      merge: (currentCache, newResponse) => {
        if (newResponse.page === 1) {
          return newResponse;
        }
        currentCache.results.push(...newResponse.results);
        currentCache.page = newResponse.page;
        return undefined;
      },
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
      merge: (currentCache, newResponse) => {
        if (newResponse.page === 1) {
          return newResponse;
        }
        currentCache.results.push(...newResponse.results);
        currentCache.page = newResponse.page;
        return undefined;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),

    getMovieDetails: builder.query<MediaDetails, MediaDetailsArgs>({
      query: ({ id, language }) => ({
        url: `/movie/${id}`,
        params: { language: toTmdbLanguage(language) },
      }),
      transformResponse: (movie: TmdbMovieDetails) =>
        toMediaDetails(movieToMedia(movie), movie.overview, movie.genres, movie.release_date),
    }),

    getPopularTv: builder.query<PaginatedResponse<Media>, MediaListArgs>({
      query: ({ page, language }) => ({
        url: '/tv/popular',
        params: { page, language: toTmdbLanguage(language), include_adult: false },
      }),
      transformResponse: (response: TmdbPaginatedResponse<TmdbTvSummary>) =>
        toPaginatedMedia(response, tvToMedia),
      serializeQueryArgs: ({ queryArgs }) => ({ language: queryArgs.language }),
      merge: (currentCache, newResponse) => {
        if (newResponse.page === 1) {
          return newResponse;
        }
        currentCache.results.push(...newResponse.results);
        currentCache.page = newResponse.page;
        return undefined;
      },
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
      merge: (currentCache, newResponse) => {
        if (newResponse.page === 1) {
          return newResponse;
        }
        currentCache.results.push(...newResponse.results);
        currentCache.page = newResponse.page;
        return undefined;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),

    getTvDetails: builder.query<MediaDetails, MediaDetailsArgs>({
      query: ({ id, language }) => ({
        url: `/tv/${id}`,
        params: { language: toTmdbLanguage(language) },
      }),
      transformResponse: (tv: TmdbTvDetails) =>
        toMediaDetails(tvToMedia(tv), tv.overview, tv.genres, tv.first_air_date),
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
} = tmdbApi;
