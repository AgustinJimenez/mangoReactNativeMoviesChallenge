import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useLayoutEffect } from 'react';

import type { RootStackParamList } from '@/navigation/types';
import type { MediaDetails } from '@/types/media';
import { ShareButton } from '@/ui/molecules/ShareButton';

// The details header stays transparent and title-less throughout (see
// screenOptions.ts) — the movie/show title already renders prominently in
// MediaDetailsHeader below the backdrop, and setting it again here would
// float a second copy that visually collides with that one once the user
// scrolls the backdrop out of view. The header only needs the share button,
// added once the query resolves.
export const useDetailsHeaderShare = (media: MediaDetails | undefined): void => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useLayoutEffect(() => {
    if (!media) {
      return;
    }

    navigation.setOptions({
      headerRight: () => <ShareButton title={media.title} message={media.overview} />,
    });
  }, [navigation, media]);
};
