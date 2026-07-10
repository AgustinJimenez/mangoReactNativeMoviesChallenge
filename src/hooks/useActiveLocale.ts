import { useTranslation } from 'react-i18next';

import { normalizeLocale } from '@/i18n/tmdbLocale';
import type { Locale } from '@/types/common';

export const useActiveLocale = (): Locale => {
  const { i18n } = useTranslation();
  return normalizeLocale(i18n.language);
};
