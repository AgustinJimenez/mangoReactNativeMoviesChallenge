export type Locale = 'es' | 'en';

export type MediaType = 'movie' | 'tv';

export type PaginatedResponse<T> = {
  page: number;
  results: T[];
  totalPages: number;
  totalResults: number;
};
