import { fireEvent } from '@testing-library/react-native';

import { toggleFavorite } from '@/store/favoritesSlice';
import { createTestStore, renderWithProviders } from '@/testUtils';
import { FavoriteButton } from '@/ui/molecules/FavoriteButton';

describe('FavoriteButton', () => {
  it('starts unfavorited and shows the outline star', () => {
    const { UNSAFE_getByProps: getIconByProps, getByLabelText } = renderWithProviders(
      <FavoriteButton id={550} mediaType="movie" />,
    );

    expect(getIconByProps({ name: 'star-outline' })).toBeTruthy();
    expect(getByLabelText('Add to favorites')).toBeTruthy();
  });

  it('toggles to favorited (filled star) when pressed', () => {
    const { UNSAFE_getByProps: getIconByProps, getByLabelText } = renderWithProviders(
      <FavoriteButton id={550} mediaType="movie" />,
    );

    fireEvent.press(getByLabelText('Add to favorites'));

    expect(getIconByProps({ name: 'star' })).toBeTruthy();
    expect(getByLabelText('Remove from favorites')).toBeTruthy();
  });

  it('toggles back to unfavorited on a second press', () => {
    const { UNSAFE_getByProps: getIconByProps, getByLabelText } = renderWithProviders(
      <FavoriteButton id={550} mediaType="movie" />,
    );

    fireEvent.press(getByLabelText('Add to favorites'));
    fireEvent.press(getByLabelText('Remove from favorites'));

    expect(getIconByProps({ name: 'star-outline' })).toBeTruthy();
  });

  it('reflects a favorite already present in the store', () => {
    const store = createTestStore();
    store.dispatch(toggleFavorite({ id: 550, mediaType: 'movie' }));

    const { UNSAFE_getByProps: getIconByProps } = renderWithProviders(
      <FavoriteButton id={550} mediaType="movie" />,
      { store },
    );

    expect(getIconByProps({ name: 'star' })).toBeTruthy();
  });

  it('only reflects favorites matching both id and mediaType', () => {
    const store = createTestStore();
    store.dispatch(toggleFavorite({ id: 550, mediaType: 'tv' }));

    const { UNSAFE_getByProps: getIconByProps } = renderWithProviders(
      <FavoriteButton id={550} mediaType="movie" />,
      { store },
    );

    expect(getIconByProps({ name: 'star-outline' })).toBeTruthy();
  });
});
