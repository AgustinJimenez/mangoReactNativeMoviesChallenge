import type { MediaType } from '@/types/common';

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export type PosterSize = 'w342' | 'w780' | 'original';

export const buildPosterUrl = (path: string, size: PosterSize): string =>
  `${TMDB_IMAGE_BASE_URL}${size}${path}`;

// Shared between MediaListItem and MediaDetailsHeader so Reanimated's
// shared element transition can match a poster across the list → detail
// navigation (see Poster.tsx's `sharedTransitionTag` prop).
export const buildPosterTransitionTag = (mediaType: MediaType, id: number): string =>
  `poster-${mediaType}-${id}`;
