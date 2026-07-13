import { useCallback, useState } from 'react';

import type { SortBy } from '@/api';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export const INITIAL_PAGE = 1;

// Shared by MoviesListScreen/TvListScreen (via useMediaListScreen) — all the
// local UI state (search text, pagination, genre/sort filters) is identical
// between the two; only which RTK Query hooks consume it differs, and that
// still has to live in each screen since useGetPopularMoviesQuery/
// useGetPopularTvQuery are separate generated hooks that can't be selected
// at runtime.
export const useMediaListState = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(INITIAL_PAGE);
  const [genreId, setGenreId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('popularity');
  const debouncedSearch = useDebouncedValue(search);
  const isSearching = debouncedSearch.trim().length > 0;

  const handleSearchChange = useCallback((text: string) => {
    setSearch(text);
    setPage(INITIAL_PAGE);
  }, []);

  const handleGenreChange = useCallback((nextGenreId: number | null) => {
    setGenreId(nextGenreId);
    setPage(INITIAL_PAGE);
  }, []);

  const handleSortChange = useCallback((nextSortBy: SortBy) => {
    setSortBy(nextSortBy);
    setPage(INITIAL_PAGE);
  }, []);

  return {
    search,
    page,
    genreId,
    sortBy,
    debouncedSearch,
    isSearching,
    setPage,
    handleSearchChange,
    handleGenreChange,
    handleSortChange,
  };
};

export type MediaListState = ReturnType<typeof useMediaListState>;
