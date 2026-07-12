import { renderWithProviders } from '@/testUtils';
import { Poster } from '@/ui/atoms/Poster';

describe('Poster', () => {
  it('falls back to the title initial when there is no path', () => {
    const { getByText } = renderWithProviders(
      <Poster path={null} title="Fight Club" size="w342" />,
    );

    expect(getByText('F')).toBeTruthy();
  });

  it('renders the poster image (no initial fallback) when a path is provided', () => {
    const { queryByText } = renderWithProviders(
      <Poster path="/poster.jpg" title="Fight Club" size="w342" />,
    );

    expect(queryByText('F')).toBeNull();
  });
});
