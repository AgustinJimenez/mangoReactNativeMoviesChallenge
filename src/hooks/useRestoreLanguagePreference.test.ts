import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderHook, waitFor } from '@testing-library/react-native';

import { useRestoreLanguagePreference } from '@/hooks/useRestoreLanguagePreference';
import { i18next } from '@/i18n';

describe('useRestoreLanguagePreference', () => {
  afterEach(async () => {
    await AsyncStorage.clear();
    await i18next.changeLanguage('en');
  });

  it('becomes ready without changing the language when nothing was saved', async () => {
    const { result } = renderHook(() => useRestoreLanguagePreference());

    expect(result.current).toBe(false);

    await waitFor(() => expect(result.current).toBe(true));

    expect(i18next.language).toBe('en');
  });

  it('applies a previously saved locale before becoming ready', async () => {
    await AsyncStorage.setItem('mangoMovies:language', 'es');

    const { result } = renderHook(() => useRestoreLanguagePreference());

    await waitFor(() => expect(result.current).toBe(true));

    expect(i18next.language).toBe('es');
  });
});
