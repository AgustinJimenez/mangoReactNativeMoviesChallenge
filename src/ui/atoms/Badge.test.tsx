import { renderWithProviders } from '@/testUtils';
import { Badge } from '@/ui/atoms/Badge';

describe('Badge', () => {
  it('renders the label text', () => {
    const { getByText } = renderWithProviders(<Badge label="Drama" />);

    expect(getByText('Drama')).toBeTruthy();
  });
});
