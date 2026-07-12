import { fireEvent } from '@testing-library/react-native';

import { i18next } from '@/i18n';
import { renderWithProviders } from '@/testUtils';
import { LanguageSwitcher } from '@/ui/molecules/LanguageSwitcher';

describe('LanguageSwitcher', () => {
  afterEach(() => {
    i18next.changeLanguage('en');
  });

  it('renders a pill for each supported locale', () => {
    const { getByLabelText } = renderWithProviders(<LanguageSwitcher />);

    expect(getByLabelText('es')).toBeTruthy();
    expect(getByLabelText('en')).toBeTruthy();
  });

  it('switches the active language when a pill is pressed', () => {
    const { getByLabelText } = renderWithProviders(<LanguageSwitcher />);

    fireEvent.press(getByLabelText('es'));

    expect(i18next.language).toBe('es');
  });
});
