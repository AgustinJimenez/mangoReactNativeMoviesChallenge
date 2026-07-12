import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Share } from 'react-native';

import { colors } from '@/theme/tokens';

const SHARE_ICON_SIZE = 20;

type ShareButtonProps = {
  title: string;
  message: string;
};

// Native OS share sheet (Share.share) — the user picks the destination
// themselves, this just hands off the title/overview text to it.
export const ShareButton = ({ title, message }: ShareButtonProps) => {
  const { t } = useTranslation();

  const handlePress = useCallback(() => {
    Share.share({ title, message }).catch(() => {});
  }, [title, message]);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={t('shareButton.label')}
      className="size-10 items-center justify-center rounded-full bg-black/25"
    >
      <Ionicons name="share-social-outline" size={SHARE_ICON_SIZE} color={colors.text} />
    </Pressable>
  );
};
