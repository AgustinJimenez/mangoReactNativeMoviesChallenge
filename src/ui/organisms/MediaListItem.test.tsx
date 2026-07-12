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
  overview: 'A ticking-time-bomb insomniac and a slippery soap salesman...',
  genreIds: [18, 53],
};

describe('MediaListItem', () => {
  it('renders the title and rating', () => {
    const { getByText } = renderWithProviders(<MediaListItem media={MOVIE} onPress={() => {}} />);

    expect(getByText('Fight Club')).toBeTruthy();
    expect(getByText('8.4')).toBeTruthy();
  });

  it('renders resolved genre names and the overview', () => {
    const { getByText } = renderWithProviders(<MediaListItem media={MOVIE} onPress={() => {}} />);

    expect(getByText('Drama • Thriller')).toBeTruthy();
    expect(getByText('A ticking-time-bomb insomniac and a slippery soap salesman...')).toBeTruthy();
  });

  it('omits the genre line when there are no known genre ids', () => {
    const { queryByText } = renderWithProviders(
      <MediaListItem media={{ ...MOVIE, genreIds: [] }} onPress={() => {}} />,
    );

    expect(queryByText('Drama • Thriller')).toBeNull();
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
