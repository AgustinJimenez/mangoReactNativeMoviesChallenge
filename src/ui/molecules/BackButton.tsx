import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Pressable } from 'react-native';

import { colors } from '@/theme/tokens';

const BACK_ICON_SIZE = 20;

// Custom headerLeft for the details screens' transparent header (see
// screenOptions.ts) — the native-stack default back arrow has no
// background of its own, which reads fine over a solid header but
// disappears over a bright backdrop image. Mirrors ShareButton's circular
// backdrop so both header icons stay legible without a full-width scrim.
export const BackButton = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => navigation.goBack()}
      accessibilityRole="button"
      accessibilityLabel={t('common.goBack')}
      className="size-10 items-center justify-center rounded-full bg-black/25"
    >
      <Ionicons name="arrow-back" size={BACK_ICON_SIZE} color={colors.text} />
    </Pressable>
  );
};
