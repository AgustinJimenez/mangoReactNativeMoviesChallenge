import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/testUtils';
import { SearchBar } from '@/ui/molecules/SearchBar';

describe('SearchBar', () => {
  it('does not render a filter button when onFilterPress is not provided', () => {
    const { queryByTestId } = renderWithProviders(<SearchBar value="" onChangeText={() => {}} />);

    expect(queryByTestId('search-bar-filter-button')).toBeNull();
  });

  it('calls onFilterPress when the filter button is pressed', () => {
    const onFilterPress = jest.fn();
    const { getByTestId } = renderWithProviders(
      <SearchBar value="" onChangeText={() => {}} onFilterPress={onFilterPress} />,
    );

    fireEvent.press(getByTestId('search-bar-filter-button'));

    expect(onFilterPress).toHaveBeenCalledTimes(1);
  });

  it('shows the active-filter indicator only when isFilterActive is true', () => {
    const { queryByTestId, rerender } = renderWithProviders(
      <SearchBar
        value=""
        onChangeText={() => {}}
        onFilterPress={() => {}}
        isFilterActive={false}
      />,
    );

    expect(queryByTestId('search-bar-filter-indicator')).toBeNull();

    rerender(
      <SearchBar value="" onChangeText={() => {}} onFilterPress={() => {}} isFilterActive={true} />,
    );

    expect(queryByTestId('search-bar-filter-indicator')).toBeTruthy();
  });
});
