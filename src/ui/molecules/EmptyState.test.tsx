import { renderWithProviders } from '@/testUtils';
import { EmptyState } from '@/ui/molecules/EmptyState';

describe('EmptyState', () => {
  it('renders the given message', () => {
    const { getByText } = renderWithProviders(<EmptyState message="No results" />);
    expect(getByText('No results')).toBeTruthy();
  });
});
