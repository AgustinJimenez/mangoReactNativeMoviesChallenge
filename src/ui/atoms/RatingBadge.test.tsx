import { renderWithProviders } from '@/testUtils';
import { RatingBadge } from '@/ui/atoms/RatingBadge';

describe('RatingBadge', () => {
  it('shows the score and the /10 suffix when there are votes', () => {
    const { getByText } = renderWithProviders(<RatingBadge voteAverage={8.4} voteCount={26000} />);

    expect(getByText('8.4')).toBeTruthy();
    expect(getByText('/10')).toBeTruthy();
  });

  it('shows "No votes" instead of a score when voteCount is 0', () => {
    const { getByText, queryByText } = renderWithProviders(
      <RatingBadge voteAverage={0} voteCount={0} />,
    );

    expect(getByText('No votes')).toBeTruthy();
    expect(queryByText('/10')).toBeNull();
  });
});
