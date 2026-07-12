import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/testUtils';
import { SortList } from '@/ui/molecules/SortList';

describe('SortList', () => {
  it('renders every sort option', () => {
    const { getByText } = renderWithProviders(<SortList value="popularity" onChange={() => {}} />);

    expect(getByText('Popularity')).toBeTruthy();
    expect(getByText('Highest Rated')).toBeTruthy();
    expect(getByText('Newest')).toBeTruthy();
    expect(getByText('Title A-Z')).toBeTruthy();
  });

  it('calls onChange with the tapped option', () => {
    const onChange = jest.fn();
    const { getByText } = renderWithProviders(<SortList value="popularity" onChange={onChange} />);

    fireEvent.press(getByText('Highest Rated'));

    expect(onChange).toHaveBeenCalledWith('rating');
  });
});
