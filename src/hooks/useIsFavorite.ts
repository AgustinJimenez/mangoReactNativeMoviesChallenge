import { useAppSelector } from '@/hooks/useAppSelector';
import type { MediaType } from '@/types/common';

// Granular selector: a component reading only this returns true/false for
// one specific (id, mediaType) pair, so toggling a favorite elsewhere in a
// list doesn't re-render every other item — only the one that changed.
export const useIsFavorite = (id: number, mediaType: MediaType): boolean =>
  useAppSelector((state) =>
    state.favorites.items.some((item) => item.id === id && item.mediaType === mediaType),
  );
