import { fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { renderWithProviders } from '@/testUtils';
import { TrailerSection } from '@/ui/molecules/TrailerSection';

describe('TrailerSection', () => {
  it('renders nothing when there is no trailer', () => {
    const { toJSON } = renderWithProviders(<TrailerSection trailerKey={null} />);

    expect(toJSON()).toBeNull();
  });

  it('shows the trailer label and YouTube attribution when a trailer exists', () => {
    const { getByText } = renderWithProviders(<TrailerSection trailerKey="abc123" />);

    expect(getByText('Official Trailer')).toBeTruthy();
    expect(getByText('YouTube')).toBeTruthy();
  });

  it('opens the YouTube watch URL for the trailer key when pressed', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const { getByLabelText } = renderWithProviders(<TrailerSection trailerKey="abc123" />);

    fireEvent.press(getByLabelText('Official Trailer'));

    expect(openURL).toHaveBeenCalledWith('https://www.youtube.com/watch?v=abc123');

    openURL.mockRestore();
  });
});
