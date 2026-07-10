import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/testUtils';
import { ErrorState } from '@/ui/molecules/ErrorState';

describe('ErrorState', () => {
  it('shows the unauthorized message for a 401 status', () => {
    const { getByText } = renderWithProviders(<ErrorState status={401} onRetry={() => {}} />);
    expect(getByText('Check your TMDB API key in the .env file')).toBeTruthy();
  });

  it('shows the generic message for any other status', () => {
    const { getByText } = renderWithProviders(<ErrorState status={500} onRetry={() => {}} />);
    expect(getByText("We couldn't load this content")).toBeTruthy();
  });

  it('shows the generic message when no status is given', () => {
    const { getByText } = renderWithProviders(<ErrorState onRetry={() => {}} />);
    expect(getByText("We couldn't load this content")).toBeTruthy();
  });

  it('calls onRetry when the retry button is pressed', () => {
    const onRetry = jest.fn();
    const { getByText } = renderWithProviders(<ErrorState onRetry={onRetry} />);

    fireEvent.press(getByText('Retry'));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
