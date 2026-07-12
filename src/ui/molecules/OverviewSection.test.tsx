import { renderWithProviders } from '@/testUtils';
import { OverviewSection } from '@/ui/molecules/OverviewSection';

describe('OverviewSection', () => {
  it('renders the overview text with its header', () => {
    const { getByText } = renderWithProviders(
      <OverviewSection overview="A ticking-time-bomb insomniac..." />,
    );

    expect(getByText('Overview')).toBeTruthy();
    expect(getByText('A ticking-time-bomb insomniac...')).toBeTruthy();
  });

  it('shows a "no overview available" message instead of the real text when TMDB has none for the active language', () => {
    const { getByText, queryByText } = renderWithProviders(<OverviewSection overview="" />);

    expect(getByText('Overview')).toBeTruthy();
    expect(getByText('No overview available')).toBeTruthy();
    expect(queryByText('A ticking-time-bomb insomniac...')).toBeNull();
  });
});
