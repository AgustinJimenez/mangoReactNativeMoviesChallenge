import { fireEvent } from '@testing-library/react-native';
import { Share } from 'react-native';

import { renderWithProviders } from '@/testUtils';
import { ShareButton } from '@/ui/molecules/ShareButton';

describe('ShareButton', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('opens the native share sheet with the title and message when pressed', () => {
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });

    const { getByLabelText } = renderWithProviders(
      <ShareButton title="Fight Club" message="A ticking-time-bomb insomniac..." />,
    );

    fireEvent.press(getByLabelText('Share'));

    expect(Share.share).toHaveBeenCalledWith({
      title: 'Fight Club',
      message: 'A ticking-time-bomb insomniac...',
    });
  });
});
