'use client';

import { useTranslations } from '@/lib/localization/useTranslations';
import { OphNextJsThemeProvider } from '@opetushallitus/oph-design-system/next/theme';

export const LocalizedThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getLanguage } = useTranslations();
  return (
    <OphNextJsThemeProvider lang={getLanguage()} variant="oph">
      {children}
    </OphNextJsThemeProvider>
  );
};
