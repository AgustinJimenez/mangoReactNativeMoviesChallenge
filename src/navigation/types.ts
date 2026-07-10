// Flat param list covering every route regardless of which stack registers
// it (MovieDetails/TvDetails are reachable from their own tab's stack *and*
// from FavoritesStack). Splitting this into per-stack ParamLists with
// CompositeScreenProps is a step 12 concern (building the actual
// Tab/Stack.Navigator tree) — pages only need this much to type their
// navigation.navigate() calls correctly.
export type RootStackParamList = {
  MoviesList: undefined;
  MovieDetails: { id: number };
  TvList: undefined;
  TvDetails: { id: number };
  FavoritesList: undefined;
};
