import { renderWithProviders } from '@/testUtils';
import { Backdrop } from '@/ui/atoms/Backdrop';

describe('Backdrop', () => {
  it('renders an empty placeholder block when there is no backdrop path', () => {
    const { toJSON } = renderWithProviders(<Backdrop path={null} />);

    expect(toJSON()).toBeTruthy();
  });

  it('renders the backdrop image when a path is provided', () => {
    const { toJSON } = renderWithProviders(<Backdrop path="/backdrop.jpg" />);

    expect(toJSON()).toBeTruthy();
  });
});
