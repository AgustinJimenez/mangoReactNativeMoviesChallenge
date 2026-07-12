import { fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/testUtils';
import type { Media } from '@/types/media';
import { RecommendationsList } from '@/ui/organisms/RecommendationsList';

const RECOMMENDATIONS: Media[] = [
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
];

describe('RecommendationsList', () => {
  it('renders nothing when there are no recommendations', () => {
    const { toJSON } = renderWithProviders(
      <RecommendationsList recommendations={[]} onPressMedia={() => {}} />,
    );

    expect(toJSON()).toBeNull();
  });

  it('renders a card per recommendation', () => {
    const { getByText } = renderWithProviders(
      <RecommendationsList recommendations={RECOMMENDATIONS} onPressMedia={() => {}} />,
    );

    expect(getByText('Se7en')).toBeTruthy();
    expect(getByText('8.4')).toBeTruthy();
  });

  it('calls onPressMedia with the tapped recommendation', () => {
    const onPressMedia = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <RecommendationsList recommendations={RECOMMENDATIONS} onPressMedia={onPressMedia} />,
    );

    fireEvent.press(getByLabelText('Se7en'));

    expect(onPressMedia).toHaveBeenCalledWith(RECOMMENDATIONS[0]);
  });
});
