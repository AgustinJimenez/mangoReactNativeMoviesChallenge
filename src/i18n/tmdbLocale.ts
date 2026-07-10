import type { Locale } from '@/types/common';

const TMDB_LOCALE_BY_LANGUAGE: Record<Locale, string> = {
  es: 'es-ES',
  en: 'en-US',
};

const SUPPORTED_LOCALES: Locale[] = ['es', 'en'];
const FALLBACK_LOCALE: Locale = 'es';

export const normalizeLocale = (language: string): Locale => {
  const candidate = language.split('-')[0] ?? language;
  return (SUPPORTED_LOCALES as string[]).includes(candidate)
    ? (candidate as Locale)
    : FALLBACK_LOCALE;
};

export const toTmdbLanguage = (language: string): string =>
  TMDB_LOCALE_BY_LANGUAGE[normalizeLocale(language)];
