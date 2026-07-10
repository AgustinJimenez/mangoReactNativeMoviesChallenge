import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import type { ListRenderItem } from 'react-native';

import { useAppSelector } from '@/hooks/useAppSelector';
import { ROUTES } from '@/navigation/routes';
import type { RootStackParamList } from '@/navigation/types';
import type { FavoriteEntry } from '@/store/favoritesSlice';
import type { Media } from '@/types/media';
import { FavoriteEntryItem } from '@/ui/organisms/FavoriteEntryItem';
import { ListTemplate } from '@/ui/templates/ListTemplate';

const noop = () => {};

const keyExtractor = (item: FavoriteEntry): string => `${item.mediaType}-${item.id}`;

export const FavoritesScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const favorites = useAppSelector((state) => state.favorites.items);

  const handlePressMedia = useCallback(
    (media: Media) => {
      const route = media.mediaType === 'movie' ? ROUTES.MOVIE_DETAILS : ROUTES.TV_DETAILS;
      navigation.navigate(route, { id: media.id });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<FavoriteEntry> = useCallback(
    ({ item }) => <FavoriteEntryItem entry={item} onPress={handlePressMedia} />,
    [handlePressMedia],
  );

  return (
    <ListTemplate<FavoriteEntry>
      data={favorites}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      isLoading={false}
      isFetching={false}
      isError={false}
      onRetry={noop}
      emptyMessage={t('favoritesScreen.empty')}
    />
  );
};
