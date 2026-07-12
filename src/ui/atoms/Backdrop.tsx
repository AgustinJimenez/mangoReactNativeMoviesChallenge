import { Image } from 'expo-image';
import { memo } from 'react';
import { View } from 'react-native';

import { buildPosterUrl } from '@/utils/image';

const BACKDROP_HEIGHT = 220;
const backdropStyle = { height: BACKDROP_HEIGHT };

type BackdropProps = {
  path: string | null;
};

// The details header's hero image. Unlike Poster, there's no letter
// fallback for a missing backdrop — TMDB often just doesn't have one for
// newer/obscure titles, and there's no sensible single-letter substitute
// for a wide "movie still" image — so a missing one just leaves the
// surface-colored block underneath empty.
//
// No top scrim here — the details screen's native-stack header is
// transparent and floats over this image (see screenOptions.ts), and a
// full-width dark strip ended up hiding too much of the image itself.
// BackButton/ShareButton each carry their own small circular backdrop
// instead, so only the icons get contrast help, not the whole band.
export const Backdrop = memo(({ path }: BackdropProps) => {
  if (!path) {
    return <View className="bg-surface" style={backdropStyle} />;
  }

  return (
    <Image
      source={{ uri: buildPosterUrl(path, 'w780') }}
      style={backdropStyle}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
  );
});
