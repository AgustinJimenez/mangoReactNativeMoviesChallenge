import { renderWithProviders } from '@/testUtils';
import { SkeletonBlock } from '@/ui/atoms/SkeletonBlock';

describe('SkeletonBlock', () => {
  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<SkeletonBlock className="h-4 w-full" />);

    expect(toJSON()).toBeTruthy();
  });
});
