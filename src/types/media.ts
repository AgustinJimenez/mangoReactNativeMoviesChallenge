import type { MediaType } from '@/types/common';

export type Genre = {
  id: number;
  name: string;
};

export type Media = {
  id: number;
  mediaType: MediaType;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  voteCount: number;
};

export type MediaDetails = Media & {
  overview: string;
  genres: Genre[];
  releaseDate: string;
};
