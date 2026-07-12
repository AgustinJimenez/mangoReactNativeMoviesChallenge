import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/testUtils';
import { GenreChips } from '@/ui/molecules/GenreChips';

describe('GenreChips', () => {
  it('renders an "All" chip plus one per genre', () => {
    const { getByText } = renderWithProviders(
      <GenreChips mediaType="movie" value={null} onChange={() => {}} />,
    );

    expect(getByText('All')).toBeTruthy();
    expect(getByText('Action')).toBeTruthy();
  });

  it('calls onChange with the tapped genre id', () => {
    const onChange = jest.fn();
    const { getByText } = renderWithProviders(
      <GenreChips mediaType="movie" value={null} onChange={onChange} />,
    );

    fireEvent.press(getByText('Action'));

    expect(onChange).toHaveBeenCalledWith(28);
  });
});
