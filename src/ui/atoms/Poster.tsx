import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { buildPosterUrl } from '@/utils/image';
import type { PosterSize } from '@/utils/image';

// expo-image isn't one of the primitives NativeWind wraps by default —
// this registers it so <Image className="..."> works, same pattern as any
// other third-party native component (see docs/planning.md "Estilos").
cssInterop(Image, { className: 'style' });

type PosterProps = {
  path: string | null;
  title: string;
  size: PosterSize;
};

export const Poster = ({ path, title, size }: PosterProps) => {
  const [failedToLoad, setFailedToLoad] = useState(false);

  if (!path || failedToLoad) {
    return (
      <View className="aspect-[2/3] items-center justify-center rounded-lg bg-surface">
        <Text className="text-2xl font-bold text-textMuted">{title.charAt(0).toUpperCase()}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: buildPosterUrl(path, size) }}
      className="aspect-[2/3] rounded-lg bg-surface"
      contentFit="cover"
      cachePolicy="memory-disk"
      onError={() => setFailedToLoad(true)}
    />
  );
};
