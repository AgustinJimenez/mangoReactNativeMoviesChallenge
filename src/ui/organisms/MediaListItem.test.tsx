import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/testUtils';
import type { Media } from '@/types/media';
import { MediaListItem } from '@/ui/organisms/MediaListItem';

const MOVIE: Media = {
  id: 550,
  mediaType: 'movie',
  title: 'Fight Club',
  posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  voteAverage: 8.4,
  voteCount: 26000,
};

describe('MediaListItem', () => {
  it('renders the title and rating', () => {
    const { getByText } = renderWithProviders(<MediaListItem media={MOVIE} onPress={() => {}} />);

    expect(getByText('Fight Club')).toBeTruthy();
    expect(getByText('8.4')).toBeTruthy();
  });

  it('shows "No votes" instead of a score when voteCount is 0', () => {
    const { getByText } = renderWithProviders(
      <MediaListItem media={{ ...MOVIE, voteCount: 0 }} onPress={() => {}} />,
    );

    expect(getByText('No votes')).toBeTruthy();
  });

  it('falls back to the title initial when there is no poster', () => {
    const { getByText } = renderWithProviders(
      <MediaListItem media={{ ...MOVIE, posterPath: null }} onPress={() => {}} />,
    );

    expect(getByText('F')).toBeTruthy();
  });

  it('calls onPress with the media when the row is tapped', () => {
    const onPress = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <MediaListItem media={MOVIE} onPress={onPress} />,
    );

    fireEvent.press(getByLabelText('Fight Club'));

    expect(onPress).toHaveBeenCalledWith(MOVIE);
  });
});
