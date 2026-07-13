import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Locale } from '@/types/common';

// Separate from i18next's own device-locale detection (see index.ts) — this
// remembers a language the user explicitly picked via LanguageSwitcher, so
// it survives an app restart instead of always reverting to whatever the
// device is set to (i18next.init()'s lng is re-detected fresh on every
// launch and never itself persisted).
const STORAGE_KEY = 'mangoMovies:language';

const isLocale = (value: string | null): value is Locale => value === 'es' || value === 'en';

export const getSavedLanguage = async (): Promise<Locale | null> => {
  const saved = await AsyncStorage.getItem(STORAGE_KEY);
  return isLocale(saved) ? saved : null;
};

// Fire-and-forget, matching how LanguageSwitcher already calls
// i18n.changeLanguage() without awaiting it — a failed write here just
// means the next restart falls back to device-locale detection instead of
// the user's last choice, not worth surfacing as an error to the user.
export const saveLanguage = (locale: Locale): void => {
  AsyncStorage.setItem(STORAGE_KEY, locale).catch(() => {});
};
