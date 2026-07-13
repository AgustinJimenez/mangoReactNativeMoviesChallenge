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
  overview: string;
  // Raw TMDB genre IDs from list/search summaries — those endpoints only
  // return IDs, not names (resolving to names needs a lookup, see
  // utils/genres.ts). MediaDetails.genres below is a *different* field with
  // full { id, name } objects, since the single-item details endpoint does
  // return names directly.
  genreIds: number[];
};

export type CastMember = {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
};

export type MediaDetails = Media & {
  genres: Genre[];
  releaseDate: string;
  backdropPath: string | null;
  // TV doesn't have a single "runtime" field in TMDB (episodes vary) — see
  // api/index.ts's tvDetailsToMediaDetails, which takes the first episode's
  // runtime as an approximation. null when TMDB has no runtime data at all
  // (common for just-announced titles).
  runtimeMinutes: number | null;
  // Capped to a handful of top-billed members (see MAX_CAST_MEMBERS in
  // api/index.ts) — this is a details-page cast strip, not a full credits list.
  cast: CastMember[];
  // First YouTube trailer TMDB returns for this title, or null if none
  // exists yet — TrailerSection doesn't render at all in that case, see
  // findTrailerKey in api/index.ts for the selection logic.
  trailerKey: string | null;
  recommendations: Media[];
  // Age rating (e.g. "PG-13", "R", "16") for the region matching the active
  // locale — null when TMDB has no certification on file for that region.
  // See findMovieCertification/findTvCertification in api/index.ts.
  certification: string | null;
};
