import { renderWithProviders } from '@/testUtils';
import { ListHeader } from '@/ui/molecules/ListHeader';

describe('ListHeader', () => {
  it('renders the title and subtitle', () => {
    const { getByText } = renderWithProviders(
      <ListHeader title="Movies" subtitle="Discover popular movies" />,
    );

    expect(getByText('Movies')).toBeTruthy();
    expect(getByText('Discover popular movies')).toBeTruthy();
  });

  it('omits the subtitle when none is provided', () => {
    const { queryByText } = renderWithProviders(<ListHeader title="Movies" />);

    expect(queryByText('Discover popular movies')).toBeNull();
  });
});
