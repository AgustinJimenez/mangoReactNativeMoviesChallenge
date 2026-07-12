import { renderWithProviders } from '@/testUtils';
import { RefreshIndicator } from '@/ui/atoms/RefreshIndicator';

describe('RefreshIndicator', () => {
  it('renders', () => {
    const { getByTestId } = renderWithProviders(<RefreshIndicator />);

    expect(getByTestId('refresh-indicator')).toBeTruthy();
  });
});
