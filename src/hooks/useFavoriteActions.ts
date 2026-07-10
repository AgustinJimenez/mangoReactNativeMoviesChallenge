import { useCallback } from 'react';

import { useAppDispatch } from '@/hooks/useAppDispatch';
import { toggleFavorite } from '@/store/favoritesSlice';
import type { FavoriteEntry } from '@/store/favoritesSlice';

// Split from useIsFavorite so a component that only dispatches the toggle
// (and doesn't need to read favorite state) isn't subscribed to it.
export const useFavoriteActions = () => {
  const dispatch = useAppDispatch();

  const toggle = useCallback((entry: FavoriteEntry) => dispatch(toggleFavorite(entry)), [dispatch]);

  return { toggleFavorite: toggle };
};
