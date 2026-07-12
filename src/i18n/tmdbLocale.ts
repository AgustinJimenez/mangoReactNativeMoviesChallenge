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

// Certifications (release_dates/content_ratings) are per-country, unlike
// the rest of TMDB's data — this picks the region half of the same
// es-ES/en-US mapping above rather than a separate table, so the
// certification shown always matches the country the request already
// reads dates/content in.
export const toTmdbRegion = (language: string): string =>
  toTmdbLanguage(language).split('-')[1] ?? 'US';
