import { fireEvent } from '@testing-library/react-native';
import { ScrollView } from 'react-native';

import { renderWithProviders } from '@/testUtils';
import type { MediaDetails } from '@/types/media';
import { DetailsTemplate } from '@/ui/templates/DetailsTemplate';

const MOVIE_DETAILS: MediaDetails = {
  id: 550,
  mediaType: 'movie',
  title: 'Fight Club',
  posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  backdropPath: '/backdrop.jpg',
  voteAverage: 8.4,
  voteCount: 26000,
  overview: 'A ticking-time-bomb insomniac...',
  genreIds: [18, 53],
  genres: [
    { id: 18, name: 'Drama' },
    { id: 53, name: 'Thriller' },
  ],
  releaseDate: '1999-10-15',
  runtimeMinutes: 139,
  cast: [],
  trailerKey: null,
  recommendations: [
    {
      id: 551,
      mediaType: 'movie',
      title: 'Se7en',
      posterPath: '/se7en.jpg',
      voteAverage: 8.4,
      voteCount: 18000,
      overview: 'Two detectives hunt a serial killer...',
      genreIds: [80, 18],
    },
  ],
  certification: 'R',
};

const renderDetailsTemplate = (overrides: Partial<Parameters<typeof DetailsTemplate>[0]> = {}) => {
  const onRetry = jest.fn();
  const onPressRecommendation = jest.fn();

  const result = renderWithProviders(
    <DetailsTemplate
      media={undefined}
      isLoading={false}
      isFetching={false}
      isError={false}
      onRetry={onRetry}
      onPressRecommendation={onPressRecommendation}
      {...overrides}
    />,
  );

  return { ...result, onRetry, onPressRecommendation };
};

describe('DetailsTemplate', () => {
  it('shows the skeleton while loading', () => {
    const { getByLabelText } = renderDetailsTemplate({ isLoading: true });

    expect(getByLabelText('Loading…')).toBeTruthy();
  });

  it('shows a full-page error when there is no media to fall back on', () => {
    const { getByText } = renderDetailsTemplate({ isError: true, media: undefined });

    expect(getByText("We couldn't load this content")).toBeTruthy();
  });

  it('calls onRetry when the error state retry button is pressed', () => {
    const { getByLabelText, onRetry } = renderDetailsTemplate({ isError: true, media: undefined });

    fireEvent.press(getByLabelText('Retry'));

    expect(onRetry).toHaveBeenCalled();
  });

  it('renders the full details content once media is available', () => {
    const { getByText } = renderDetailsTemplate({ media: MOVIE_DETAILS });

    expect(getByText('Fight Club')).toBeTruthy();
    expect(getByText('A ticking-time-bomb insomniac...')).toBeTruthy();
    expect(getByText('Se7en')).toBeTruthy();
  });

  it('calls onPressRecommendation with the tapped recommendation', () => {
    const { getByLabelText, onPressRecommendation } = renderDetailsTemplate({
      media: MOVIE_DETAILS,
    });

    fireEvent.press(getByLabelText('Se7en'));

    expect(onPressRecommendation).toHaveBeenCalledWith(MOVIE_DETAILS.recommendations[0]);
  });

  it('shows RefreshIndicator instead of the skeleton when revalidating cached data', () => {
    const { getByTestId, queryByLabelText } = renderDetailsTemplate({
      media: MOVIE_DETAILS,
      isFetching: true,
    });

    expect(getByTestId('refresh-indicator')).toBeTruthy();
    expect(queryByLabelText('Loading…')).toBeNull();
  });

  it('shows a stale-data notice instead of a full-page error when a background refetch fails', () => {
    const { getByText, queryByText } = renderDetailsTemplate({
      media: MOVIE_DETAILS,
      isError: true,
    });

    expect(getByText("Couldn't refresh, showing saved data")).toBeTruthy();
    expect(queryByText("We couldn't load this content")).toBeNull();
    expect(getByText('Fight Club')).toBeTruthy();
  });

  it('calls onRetry when pulled to refresh, giving a way to recover from the stale-data notice', () => {
    // RNTL's fireEvent(el, 'refresh') only auto-forwards to a nested
    // RefreshControl for FlatList/SectionList's own onRefresh convenience
    // prop, not for a bare ScrollView's refreshControl element — so this
    // reaches the same onRefresh handler the real pull gesture would call,
    // straight off the element passed to the ScrollView's refreshControl prop.
    const { UNSAFE_getByType: getByType, onRetry } = renderDetailsTemplate({
      media: MOVIE_DETAILS,
      isError: true,
    });

    getByType(ScrollView).props.refreshControl.props.onRefresh();

    expect(onRetry).toHaveBeenCalled();
  });
});
