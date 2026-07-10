import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { findBestLanguageTag } from 'react-native-localize';

import type { Locale } from '@/types/common';

import en from './locales/en.json';
import es from './locales/es.json';

const resources = {
  es: { common: es },
  en: { common: en },
};

const supportedLocales: Locale[] = ['es', 'en'];
const fallbackLocale: Locale = 'es';

const detectedLanguage =
  findBestLanguageTag(supportedLocales)?.languageTag.split('-')[0] ?? fallbackLocale;

i18next.use(initReactI18next).init({
  resources,
  lng: detectedLanguage,
  fallbackLng: fallbackLocale,
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

export { i18next };
