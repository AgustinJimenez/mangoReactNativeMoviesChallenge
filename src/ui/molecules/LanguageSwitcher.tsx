import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import type { Locale } from '@/types/common';

const LOCALES: Locale[] = ['es', 'en'];

export const LanguageSwitcher = () => {
  const { t, i18n } = useTranslation();

  return (
    <View className="flex-row gap-xs">
      {LOCALES.map((locale) => {
        const isActive = i18n.language === locale;
        const pillClassName = isActive
          ? 'rounded-full bg-primary px-md py-xs'
          : 'rounded-full bg-surface px-md py-xs';
        const labelClassName = isActive
          ? 'text-xs font-bold uppercase text-background'
          : 'text-xs font-bold uppercase text-textMuted';

        return (
          <Pressable
            key={locale}
            onPress={() => i18n.changeLanguage(locale)}
            accessibilityRole="button"
            accessibilityLabel={locale}
            accessibilityHint={t('languageSwitcher.hint')}
            className={pillClassName}
          >
            <Text className={labelClassName}>{locale}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};
