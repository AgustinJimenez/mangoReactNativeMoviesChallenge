import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, Text, View } from 'react-native';

import { colors } from '@/theme/tokens';

const PLAY_ICON_SIZE = 40;
const LINK_ICON_SIZE = 16;
const THUMBNAIL_WIDTH = 160;
const VIDEO_ASPECT_WIDTH = 16;
const VIDEO_ASPECT_HEIGHT = 9;
const thumbnailStyle = {
  width: THUMBNAIL_WIDTH,
  aspectRatio: VIDEO_ASPECT_WIDTH / VIDEO_ASPECT_HEIGHT,
};

// No API key needed — YouTube serves a thumbnail for any video id at this
// well-known, stable URL pattern.
const buildYoutubeThumbnailUrl = (key: string) => `https://img.youtube.com/vi/${key}/hqdefault.jpg`;
const buildYoutubeWatchUrl = (key: string) => `https://www.youtube.com/watch?v=${key}`;

type TrailerThumbnailProps = {
  trailerKey: string;
};

const TrailerThumbnail = ({ trailerKey }: TrailerThumbnailProps) => (
  <View
    className="items-center justify-center overflow-hidden rounded-lg bg-surface"
    style={thumbnailStyle}
  >
    <Image
      source={{ uri: buildYoutubeThumbnailUrl(trailerKey) }}
      style={thumbnailStyle}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
    <View className="absolute inset-0 items-center justify-center bg-black/30">
      <Ionicons name="play-circle" size={PLAY_ICON_SIZE} color={colors.text} />
    </View>
  </View>
);

const TrailerInfo = () => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 gap-xs">
      <Text className="text-sm font-semibold text-text">
        {t('detailsTemplate.officialTrailer')}
      </Text>
      <View className="flex-row items-center gap-xs">
        <Text className="text-sm text-textMuted">{t('detailsTemplate.youtube')}</Text>
        <Ionicons name="open-outline" size={LINK_ICON_SIZE} color={colors.textMuted} />
      </View>
    </View>
  );
};

type TrailerSectionProps = {
  trailerKey: string | null;
};

// Omits itself entirely when TMDB has no trailer video for this title yet.
// Opens the real YouTube app/site externally instead of an embedded player
// — no new native dependency (react-native-webview) needed for that.
export const TrailerSection = ({ trailerKey }: TrailerSectionProps) => {
  const { t } = useTranslation();

  if (!trailerKey) {
    return null;
  }

  const handlePress = () => {
    Linking.openURL(buildYoutubeWatchUrl(trailerKey)).catch(() => {});
  };

  return (
    <View className="gap-sm px-md">
      <Text className="text-base font-semibold text-text">{t('detailsTemplate.trailer')}</Text>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={t('detailsTemplate.officialTrailer')}
        accessibilityHint={t('detailsTemplate.officialTrailerHint')}
        className="flex-row items-center gap-md"
      >
        <TrailerThumbnail trailerKey={trailerKey} />
        <TrailerInfo />
      </Pressable>
    </View>
  );
};
