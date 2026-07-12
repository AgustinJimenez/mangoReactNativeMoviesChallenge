import { fireEvent } from '@testing-library/react-native';
import type { ComponentProps } from 'react';

import { renderWithProviders } from '@/testUtils';
import { FiltersModal } from '@/ui/molecules/FiltersModal';

const noop = () => {};

const renderFiltersModal = (props: Partial<ComponentProps<typeof FiltersModal>> = {}) =>
  renderWithProviders(
    <FiltersModal
      visible
      onClose={noop}
      mediaType="movie"
      genreId={null}
      onGenreChange={noop}
      sortBy="popularity"
      onSortChange={noop}
      {...props}
    />,
  );

describe('FiltersModal', () => {
  it('renders nothing interactable when closed', () => {
    const { queryByText } = renderFiltersModal({ visible: false });

    expect(queryByText('Filters')).toBeNull();
  });

  it('shows both the genre chips and the sort options when open', () => {
    const { getByLabelText } = renderFiltersModal();

    expect(getByLabelText('Action')).toBeTruthy();
    expect(getByLabelText('Highest Rated')).toBeTruthy();
  });

  it('does not call onGenreChange or onSortChange while a selection is only staged', () => {
    // Taps inside the sheet only update local draft state — the real
    // callbacks (which reset pagination and trigger a refetch) only fire
    // once, on close. See FiltersModal's own comment for why.
    const onGenreChange = jest.fn();
    const onSortChange = jest.fn();
    const { getByLabelText } = renderFiltersModal({ onGenreChange, onSortChange });

    fireEvent.press(getByLabelText('Action'));
    fireEvent.press(getByLabelText('Highest Rated'));

    expect(onGenreChange).not.toHaveBeenCalled();
    expect(onSortChange).not.toHaveBeenCalled();
  });

  it('commits the staged genre and sort changes when the sheet closes', () => {
    const onGenreChange = jest.fn();
    const onSortChange = jest.fn();
    const onClose = jest.fn();
    const { getByLabelText, getAllByLabelText } = renderFiltersModal({
      onGenreChange,
      onSortChange,
      onClose,
    });

    fireEvent.press(getByLabelText('Action'));
    fireEvent.press(getByLabelText('Highest Rated'));
    fireEvent.press(getAllByLabelText('Close')[0]!);

    expect(onGenreChange).toHaveBeenCalledWith(28);
    expect(onSortChange).toHaveBeenCalledWith('rating');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onGenreChange/onSortChange when closing without changing anything', () => {
    // A prior version of this bug: committing unconditionally on close
    // reset MoviesListScreen's pagination back to page 1 just from
    // opening and closing the sheet, even with no actual filter change.
    const onGenreChange = jest.fn();
    const onSortChange = jest.fn();
    const { getAllByLabelText } = renderFiltersModal({
      genreId: 28,
      sortBy: 'rating',
      onGenreChange,
      onSortChange,
    });

    fireEvent.press(getAllByLabelText('Close')[0]!);

    expect(onGenreChange).not.toHaveBeenCalled();
    expect(onSortChange).not.toHaveBeenCalled();
  });

  it('lists tv-specific genres for mediaType="tv"', () => {
    const { getByLabelText, queryByLabelText } = renderFiltersModal({ mediaType: 'tv' });

    expect(getByLabelText('Action & Adventure')).toBeTruthy();
    expect(queryByLabelText('Adventure')).toBeNull();
  });
});
