import { renderWithProviders } from '@/testUtils';
import { DetailsSkeleton } from '@/ui/organisms/DetailsSkeleton';

describe('DetailsSkeleton', () => {
  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<DetailsSkeleton />);

    expect(toJSON()).toBeTruthy();
  });

  it('exposes a progressbar role with the loading message for screen readers', () => {
    const { getByLabelText } = renderWithProviders(<DetailsSkeleton />);

    expect(getByLabelText('Loading…')).toBeTruthy();
  });
});
