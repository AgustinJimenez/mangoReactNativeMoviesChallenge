import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { MediaType } from '@/types/common';

export type FavoriteEntry = {
  id: number;
  mediaType: MediaType;
};

type FavoritesState = {
  items: FavoriteEntry[];
};

const initialState: FavoritesState = {
  items: [],
};

const isSameEntry = (a: FavoriteEntry, b: FavoriteEntry): boolean =>
  a.id === b.id && a.mediaType === b.mediaType;

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<FavoriteEntry>) => {
      const index = state.items.findIndex((item) => isSameEntry(item, action.payload));
      if (index === -1) {
        state.items.push(action.payload);
        return;
      }
      state.items.splice(index, 1);
    },
  },
});

export const { toggleFavorite } = favoritesSlice.actions;
