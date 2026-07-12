import NetInfo from '@react-native-community/netinfo';
import { act } from '@testing-library/react-native';

import { renderWithProviders } from '@/testUtils';
import { OfflineBanner } from '@/ui/molecules/OfflineBanner';

describe('OfflineBanner', () => {
  it('renders nothing while connected', () => {
    const { toJSON } = renderWithProviders(<OfflineBanner />);

    expect(toJSON()).toBeNull();
  });

  it('shows the offline message once NetInfo reports a disconnect', () => {
    const { getByText } = renderWithProviders(<OfflineBanner />);
    const listener = jest.mocked(NetInfo.addEventListener).mock.calls.at(-1)![0];

    // The listener fires outside RTL's own event helpers, so the resulting
    // setState needs an explicit act() to flush before asserting.
    act(() => {
      listener({ isConnected: false } as never);
    });

    expect(getByText('No internet connection')).toBeTruthy();
  });
});
