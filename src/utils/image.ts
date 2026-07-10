const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export type PosterSize = 'w342' | 'w780' | 'original';

export const buildPosterUrl = (path: string, size: PosterSize): string =>
  `${TMDB_IMAGE_BASE_URL}${size}${path}`;
