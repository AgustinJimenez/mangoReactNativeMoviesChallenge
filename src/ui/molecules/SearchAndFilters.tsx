import { useState } from 'react';
import { View } from 'react-native';

import type { SortBy } from '@/api';
import type { MediaType } from '@/types/common';
import { FiltersModal } from '@/ui/molecules/FiltersModal';
import { SearchBar } from '@/ui/molecules/SearchBar';

const DEFAULT_SORT_BY: SortBy = 'popularity';

type FiltersConfig = {
  mediaType: MediaType;
  genreId: number | null;
  onGenreChange: (genreId: number | null) => void;
  sortBy: SortBy;
  onSortChange: (sortBy: SortBy) => void;
};

type SearchAndFiltersProps = {
  searchValue: string;
  onSearchChange: (text: string) => void;
  // Only passed for the /discover-backed popular list, and only while not
  // searching (TMDB's search endpoint doesn't support with_genres/sort_by
  // — see api/index.ts). When undefined, SearchBar renders with no filter
  // icon at all instead of one that would do nothing.
  filters?: FiltersConfig;
};

// Owns the open/closed state for the combined genre+sort FiltersModal
// triggered from SearchBar's trailing filter icon, and derives the
// active-filter indicator dot from whether either value differs from its
// default.
export const SearchAndFilters = ({
  searchValue,
  onSearchChange,
  filters,
}: SearchAndFiltersProps) => {
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const isFilterActive =
    !!filters && (filters.genreId !== null || filters.sortBy !== DEFAULT_SORT_BY);

  return (
    <View className="p-md">
      <SearchBar
        value={searchValue}
        onChangeText={onSearchChange}
        onFilterPress={filters ? () => setIsFilterModalOpen(true) : undefined}
        isFilterActive={isFilterActive}
      />
      {filters && (
        <FiltersModal
          visible={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          mediaType={filters.mediaType}
          genreId={filters.genreId}
          onGenreChange={filters.onGenreChange}
          sortBy={filters.sortBy}
          onSortChange={filters.onSortChange}
        />
      )}
    </View>
  );
};
