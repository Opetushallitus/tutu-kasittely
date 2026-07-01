'use client';

import { OphThemeProvider } from '@opetushallitus/oph-design-system/theme';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { THEME_OVERRIDES } from '@/src/lib/theme';

export const LocalizedThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getLanguage } = useTranslations();
  return (
    <OphThemeProvider
      lang={getLanguage()}
      variant="oph"
      overrides={THEME_OVERRIDES}
    >
      {children}
    </OphThemeProvider>
  );
};
