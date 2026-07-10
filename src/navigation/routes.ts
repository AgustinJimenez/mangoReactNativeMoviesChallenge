// Full navigator wiring (Tab/Stack config, typed param lists) is step 12 —
// pages only need route names to call navigation.navigate() with.
export const ROUTES = {
  MOVIES_TAB: 'MoviesTab',
  TV_TAB: 'TvTab',
  FAVORITES_TAB: 'FavoritesTab',
  MOVIES_LIST: 'MoviesList',
  MOVIE_DETAILS: 'MovieDetails',
  TV_LIST: 'TvList',
  TV_DETAILS: 'TvDetails',
  FAVORITES_LIST: 'FavoritesList',
} as const;
