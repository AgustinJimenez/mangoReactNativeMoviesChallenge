import { useEffect, useState } from 'react';

import { i18next } from '@/i18n';
import { getSavedLanguage } from '@/i18n/languagePreference';

// Gates AppProviders' render — same pattern as PersistGate just below it in
// the provider tree — until a previously-saved language choice (see
// LanguageSwitcher/languagePreference.ts) has had a chance to load and
// apply. Without this, the app would render one frame in the
// device-detected language before switching to whatever the user last
// picked, a visible flash.
export const useRestoreLanguagePreference = (): boolean => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getSavedLanguage().then((saved) => {
      if (saved && saved !== i18next.language) {
        i18next.changeLanguage(saved);
      }
      if (isMounted) {
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return isReady;
};
