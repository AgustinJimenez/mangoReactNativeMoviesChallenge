import type { Locale } from '@/types/common';

const TMDB_LOCALE_BY_LANGUAGE: Record<Locale, string> = {
  es: 'es-ES',
  en: 'en-US',
};

export const toTmdbLanguage = (language: string): string => {
  const normalized = language.split('-')[0] as Locale;
  return TMDB_LOCALE_BY_LANGUAGE[normalized] ?? TMDB_LOCALE_BY_LANGUAGE.es;
};
