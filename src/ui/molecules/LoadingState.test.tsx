import { renderWithProviders } from '@/testUtils';
import { LoadingState } from '@/ui/molecules/LoadingState';

describe('LoadingState', () => {
  it('renders the loading message', () => {
    const { getByText } = renderWithProviders(<LoadingState />);
    expect(getByText('Loading…')).toBeTruthy();
  });
});
