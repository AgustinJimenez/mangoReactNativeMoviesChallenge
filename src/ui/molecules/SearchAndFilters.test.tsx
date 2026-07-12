import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/testUtils';
import { SearchAndFilters } from '@/ui/molecules/SearchAndFilters';

describe('SearchAndFilters', () => {
  it('renders the search bar', () => {
    const { getByPlaceholderText } = renderWithProviders(
      <SearchAndFilters searchValue="" onSearchChange={() => {}} />,
    );

    expect(getByPlaceholderText('Search…')).toBeTruthy();
  });

  it('omits the filter icon when no filters config is passed', () => {
    const { queryByTestId } = renderWithProviders(
      <SearchAndFilters searchValue="" onSearchChange={() => {}} />,
    );

    expect(queryByTestId('search-bar-filter-button')).toBeNull();
  });

  it('opens the filters modal when the filter icon is pressed', () => {
    const { getByTestId, getByLabelText } = renderWithProviders(
      <SearchAndFilters
        searchValue=""
        onSearchChange={() => {}}
        filters={{
          mediaType: 'movie',
          genreId: null,
          onGenreChange: () => {},
          sortBy: 'popularity',
          onSortChange: () => {},
        }}
      />,
    );

    fireEvent.press(getByTestId('search-bar-filter-button'));

    expect(getByLabelText('Action')).toBeTruthy();
  });
});
