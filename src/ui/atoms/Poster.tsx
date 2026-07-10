import { Image } from 'expo-image';
import { cssInterop } from 'nativewind';
import { memo, useState } from 'react';
import { Text } from 'react-native';
import Animated from 'react-native-reanimated';

import { buildPosterUrl } from '@/utils/image';
import type { PosterSize } from '@/utils/image';

// expo-image isn't one of the primitives NativeWind wraps by default —
// this registers it so <Image className="..."> works, same pattern as any
// other third-party native component (see docs/planning.md "Estilos").
cssInterop(Image, { className: 'style' });
cssInterop(Animated.View, { className: 'style' });

type PosterProps = {
  path: string | null;
  title: string;
  size: PosterSize;
  // Tags this poster for Reanimated's shared element transition (see
  // MediaListItem/MediaDetailsHeader, which pass the same
  // `poster-${mediaType}-${id}` tag so the poster morphs from its list
  // thumbnail into the detail header instead of a hard cut. Omitted where
  // there's no matching poster on the other side of a transition.
  sharedTransitionTag?: string;
};

// Memoized because it's rendered once per row in list/grid FlatLists — its
// props are cheap to compare (two strings + a union), and re-rendering it
// unnecessarily would re-run expo-image's layout/decode work per row.
export const Poster = memo(({ path, title, size, sharedTransitionTag }: PosterProps) => {
  const [failedToLoad, setFailedToLoad] = useState(false);

  if (!path || failedToLoad) {
    return (
      <Animated.View
        sharedTransitionTag={sharedTransitionTag}
        className="aspect-[2/3] items-center justify-center rounded-lg bg-surface"
      >
        <Text className="text-2xl font-bold text-textMuted">{title.charAt(0).toUpperCase()}</Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      sharedTransitionTag={sharedTransitionTag}
      className="aspect-[2/3] overflow-hidden rounded-lg bg-surface"
    >
      <Image
        source={{ uri: buildPosterUrl(path, size) }}
        className="size-full"
        contentFit="cover"
        cachePolicy="memory-disk"
        onError={() => setFailedToLoad(true)}
      />
    </Animated.View>
  );
});
