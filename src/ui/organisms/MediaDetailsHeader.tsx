import { FlatList, Text, View } from 'react-native';

import type { MediaDetails } from '@/types/media';
import { Badge } from '@/ui/atoms/Badge';
import { Poster } from '@/ui/atoms/Poster';
import { FavoriteButton } from '@/ui/molecules/FavoriteButton';

const GenreSeparator = () => <View className="w-xs" />;

type MediaDetailsHeaderProps = {
  media: MediaDetails;
};

export const MediaDetailsHeader = ({ media }: MediaDetailsHeaderProps) => {
  return (
    <View className="gap-md p-md">
      <View className="flex-row gap-md">
        <View className="w-32">
          <Poster path={media.posterPath} title={media.title} size="w780" />
        </View>
        <View className="flex-1 justify-end gap-xs">
          <Text className="text-xl font-bold text-text">{media.title}</Text>
          <Text className="text-sm text-textMuted">{media.releaseDate}</Text>
          <FavoriteButton id={media.id} mediaType={media.mediaType} />
        </View>
      </View>
      <FlatList
        horizontal
        data={media.genres}
        keyExtractor={(genre) => String(genre.id)}
        renderItem={({ item }) => <Badge label={item.name} />}
        ItemSeparatorComponent={GenreSeparator}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};
