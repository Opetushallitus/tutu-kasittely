'use client';

import { TolgeeProvider } from '@tolgee/react';
import { useEffect } from 'react';

import { FullSpinner } from '@/src/components/FullSpinner';
import { useAsiointiKieli } from '@/src/hooks/useAsiointikieli';
import {
  changeLanguage,
  getTolgee,
} from '@/src/lib/localization/localizations';
import { Language } from '@/src/lib/localization/localizationTypes';

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
    <TolgeeProvider tolgee={getTolgee()} fallback={<FullSpinner></FullSpinner>}>
      {children}
    </TolgeeProvider>
  );
}

export function LocalizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lng = useAsiointiKieli();
  return <LocalizationContent lng={lng}>{children}</LocalizationContent>;
}
