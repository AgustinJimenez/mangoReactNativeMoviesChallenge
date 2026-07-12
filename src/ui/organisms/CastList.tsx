import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { FlatList, Text, View } from 'react-native';
import type { ListRenderItem } from 'react-native';

import { spacing } from '@/theme/tokens';
import type { CastMember } from '@/types/media';
import { buildPosterUrl } from '@/utils/image';

const AVATAR_SIZE = 64;
const avatarStyle = { width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 };
const castContentContainerStyle = { paddingHorizontal: spacing.md };

const CastSeparator = () => <View className="w-md" />;

type CastAvatarProps = {
  member: CastMember;
};

const CastAvatar = ({ member }: CastAvatarProps) => {
  if (!member.profilePath) {
    return (
      <View className="items-center justify-center bg-surface" style={avatarStyle}>
        <Text className="text-lg font-bold text-textMuted">
          {member.name.charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: buildPosterUrl(member.profilePath, 'w185') }}
      style={avatarStyle}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
  );
};

type CastCardProps = {
  member: CastMember;
};

const CastCard = ({ member }: CastCardProps) => (
  <View className="w-20 items-center gap-xs">
    <CastAvatar member={member} />
    <Text numberOfLines={2} className="text-center text-xs font-semibold text-text">
      {member.name}
    </Text>
    <Text numberOfLines={1} className="text-center text-xs text-textMuted">
      {member.character}
    </Text>
  </View>
);

const renderItem: ListRenderItem<CastMember> = ({ item }) => <CastCard member={item} />;

type CastListProps = {
  cast: CastMember[];
};

// Omits itself entirely when there's no cast data — TMDB doesn't always
// have credits for obscure or just-added titles.
export const CastList = ({ cast }: CastListProps) => {
  const { t } = useTranslation();

  if (cast.length === 0) {
    return null;
  }

  return (
    <View className="gap-sm">
      <Text className="px-md text-base font-semibold text-text">{t('detailsTemplate.cast')}</Text>
      <FlatList
        horizontal
        data={cast}
        keyExtractor={(member) => String(member.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={CastSeparator}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={castContentContainerStyle}
      />
    </View>
  );
};
