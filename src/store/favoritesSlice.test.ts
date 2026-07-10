import { favoritesSlice, toggleFavorite } from '@/store/favoritesSlice';
import type { FavoriteEntry } from '@/store/favoritesSlice';

const MOVIE_ENTRY: FavoriteEntry = { id: 550, mediaType: 'movie' };
const TV_ENTRY: FavoriteEntry = { id: 550, mediaType: 'tv' };

describe('favoritesSlice', () => {
  it('starts with an empty items list', () => {
    const state = favoritesSlice.reducer(undefined, { type: '@@INIT' });
    expect(state.items).toEqual([]);
  });

  it('adds an entry that is not already favorited', () => {
    const state = favoritesSlice.reducer(undefined, toggleFavorite(MOVIE_ENTRY));
    expect(state.items).toEqual([MOVIE_ENTRY]);
  });

  it('removes an entry that is already favorited', () => {
    const afterAdd = favoritesSlice.reducer(undefined, toggleFavorite(MOVIE_ENTRY));
    const afterRemove = favoritesSlice.reducer(afterAdd, toggleFavorite(MOVIE_ENTRY));
    expect(afterRemove.items).toEqual([]);
  });

  it('treats the same id with a different mediaType as a distinct entry', () => {
    const afterMovie = favoritesSlice.reducer(undefined, toggleFavorite(MOVIE_ENTRY));
    const afterBoth = favoritesSlice.reducer(afterMovie, toggleFavorite(TV_ENTRY));
    expect(afterBoth.items).toEqual([MOVIE_ENTRY, TV_ENTRY]);
  });
});
