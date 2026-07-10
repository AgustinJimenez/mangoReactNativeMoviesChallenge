import { normalizeLocale, toTmdbLanguage } from '@/i18n/tmdbLocale';

describe('normalizeLocale', () => {
  it('passes through a supported locale unchanged', () => {
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('es')).toBe('es');
  });

  it('strips a region subtag before matching', () => {
    expect(normalizeLocale('en-US')).toBe('en');
    expect(normalizeLocale('es-AR')).toBe('es');
  });

  it('falls back to es for an unsupported language', () => {
    expect(normalizeLocale('fr')).toBe('es');
    expect(normalizeLocale('fr-FR')).toBe('es');
  });
});

describe('toTmdbLanguage', () => {
  it('maps a supported locale to its TMDB language parameter', () => {
    expect(toTmdbLanguage('en')).toBe('en-US');
    expect(toTmdbLanguage('es')).toBe('es-ES');
  });

  it('maps an unsupported language to the fallback locale (es)', () => {
    expect(toTmdbLanguage('fr')).toBe('es-ES');
  });

  it('normalizes a region-qualified language before mapping', () => {
    expect(toTmdbLanguage('en-GB')).toBe('en-US');
  });
});
