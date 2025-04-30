'use client';

import { changeLanguage, tolgee } from '@/lib/localization/localizations';
import { Language } from '@/lib/localization/localization-types';
import { useEffect } from 'react';
import { TolgeeProvider } from '@tolgee/react';
import { FullSpinner } from '@/components/full-spinner';

const LocalizationContent = ({
  lng,
  children,
}: {
  lng?: Language;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    if (lng) {
      changeLanguage(lng);
    }
  }, [lng]);

  return children;
};

export function MyTolgeeProvider({ children }: { children: React.ReactNode }) {
  return (
    <TolgeeProvider tolgee={tolgee} fallback={<FullSpinner></FullSpinner>}>
      {children}
    </TolgeeProvider>
  );
}

export function LocalizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LocalizationContent lng={'fi'}>{children}</LocalizationContent>;
}
