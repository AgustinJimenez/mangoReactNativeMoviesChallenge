import AsyncStorage from '@react-native-async-storage/async-storage';

import { getSavedLanguage, saveLanguage } from '@/i18n/languagePreference';

describe('languagePreference', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns null when nothing has been saved yet', async () => {
    expect(await getSavedLanguage()).toBeNull();
  });

  it('returns the saved locale after saveLanguage', async () => {
    saveLanguage('es');

    expect(await getSavedLanguage()).toBe('es');
  });

  it('returns null for a corrupted/unexpected stored value rather than passing it through', async () => {
    await AsyncStorage.setItem('mangoMovies:language', 'fr');

    expect(await getSavedLanguage()).toBeNull();
  });
});
