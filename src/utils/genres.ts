import type { TFunction } from 'i18next';

import type { MediaType } from '@/types/common';

// TMDB's genre ID lists are a fixed, documented set (see
// https://developer.themoviedb.org/reference/genre-movie-list and
// genre-tv-list) that changes rarely, so it's hardcoded here rather than
// fetched from a separate endpoint. This also keeps names localized via
// i18next regardless of which language the list/search response (which only
// carries genre_ids, not names) was requested in.
export const MOVIE_GENRE_KEYS: Record<number, string> = {
  28: 'action',
  12: 'adventure',
  16: 'animation',
  35: 'comedy',
  80: 'crime',
  99: 'documentary',
  18: 'drama',
  10751: 'family',
  14: 'fantasy',
  36: 'history',
  27: 'horror',
  10402: 'music',
  9648: 'mystery',
  10749: 'romance',
  878: 'scienceFiction',
  10770: 'tvMovie',
  53: 'thriller',
  10752: 'war',
  37: 'western',
};

export const TV_GENRE_KEYS: Record<number, string> = {
  10759: 'actionAdventure',
  16: 'animation',
  35: 'comedy',
  80: 'crime',
  99: 'documentary',
  18: 'drama',
  10751: 'family',
  10762: 'kids',
  9648: 'mystery',
  10763: 'news',
  10764: 'reality',
  10765: 'sciFiFantasy',
  10766: 'soap',
  10767: 'talk',
  10768: 'warPolitics',
  37: 'western',
};

export const resolveGenreNames = (
  genreIds: number[],
  mediaType: MediaType,
  t: TFunction,
): string[] => {
  const keys = mediaType === 'movie' ? MOVIE_GENRE_KEYS : TV_GENRE_KEYS;
  return genreIds
    .map((id) => keys[id])
    .filter((key): key is string => key !== undefined)
    .map((key) => t(`genres.${key}`));
};

// Iteration order for the genre filter chip row (GenreFilterRow). Derived
// from the maps above (object keys with numeric-looking names are always
// iterated in ascending numeric order by the JS spec, regardless of
// insertion order) rather than hand-duplicated, so there's one source of
// truth for "which genre ids exist" per media type.
export const MOVIE_GENRE_IDS: number[] = Object.keys(MOVIE_GENRE_KEYS).map(Number);
export const TV_GENRE_IDS: number[] = Object.keys(TV_GENRE_KEYS).map(Number);

export const resolveGenreName = (
  id: number,
  mediaType: MediaType,
  t: TFunction,
): string | undefined => {
  const keys = mediaType === 'movie' ? MOVIE_GENRE_KEYS : TV_GENRE_KEYS;
  const key = keys[id];
  return key ? t(`genres.${key}`) : undefined;
};
