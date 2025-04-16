import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';
import { RAAMIT_URL } from '@/lib/configuration';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { OphNextJsThemeProvider } from '@opetushallitus/oph-design-system/next/theme';
import {
  LocalizationProvider,
  MyTolgeeProvider,
} from '@/components/providers/localization-provider';
import { LocalizedThemeProvider } from '@/components/providers/localized-theme-provider';

export const metadata: Metadata = {
  title: 'Tutkintojen tunnustaminen',
  description: 'Tutkintojen tunnustamisen hakemusten käsittelyn käyttöliittymä',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fi">
      <Script src={RAAMIT_URL} />
      <body>
        <AppRouterCacheProvider>
          {/* Initialisoidaan ensin lokalisoimaton teema, jotta ensimmäisten spinnereiden tyylit tulee oikein. */}
          <OphNextJsThemeProvider variant="oph">
            <MyTolgeeProvider>
              <LocalizationProvider>
                <LocalizedThemeProvider>{children}</LocalizedThemeProvider>
              </LocalizationProvider>
            </MyTolgeeProvider>
          </OphNextJsThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
