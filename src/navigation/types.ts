export type RootTabParamList = {
  MoviesTab: undefined;
  TvTab: undefined;
  FavoritesTab: undefined;
};

export type MoviesStackParamList = {
  MoviesList: undefined;
  MovieDetails: { id: number };
};

export type TvStackParamList = {
  TvList: undefined;
  TvDetails: { id: number };
};

// Favorites can hold both movies and TV shows, so its stack owns both detail
// routes (unlike Movies/TvStack, which only own their own media type's).
export type FavoritesStackParamList = {
  FavoritesList: undefined;
  MovieDetails: { id: number };
  TvDetails: { id: number };
};

// Flat param list covering every route regardless of which stack registers
// it. MovieDetails/TvDetails are mounted in two different stacks each
// (their own tab's stack, and FavoritesStack) with an identical param shape
// ({ id: number }) in both — so pages type their navigation/route hooks
// against this flat list rather than a CompositeScreenProps union of every
// stack that could have mounted them, which the param shape never actually
// varies by anyway.
export type RootStackParamList = {
  MoviesList: undefined;
  MovieDetails: { id: number };
  TvList: undefined;
  TvDetails: { id: number };
  FavoritesList: undefined;
};
