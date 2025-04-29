import type { Metadata } from 'next';
import Script from 'next/script';
import { RAAMIT_URL } from '@/lib/configuration';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { OphNextJsThemeProvider } from '@opetushallitus/oph-design-system/next/theme';
import {
  LocalizationProvider,
  MyTolgeeProvider,
} from '@/components/providers/localization-provider';
import { ophColors, THEME_OVERRIDES } from '@/lib/theme';
import { LocalizedThemeProvider } from '@/components/providers/localized-theme-provider';
import ReactQueryClientProvider from '@/components/providers/react-query-client-provider';

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
      <body
        style={{
          backgroundColor: ophColors.grey50,
        }}
      >
        <AppRouterCacheProvider>
          {/* Initialisoidaan ensin lokalisoimaton teema, jotta ensimmäisten spinnereiden tyylit tulee oikein. */}
          <OphNextJsThemeProvider variant="oph" overrides={THEME_OVERRIDES}>
            <ReactQueryClientProvider>
              <MyTolgeeProvider>
                <LocalizationProvider>
                  <LocalizedThemeProvider>{children}</LocalizedThemeProvider>
                </LocalizationProvider>
              </MyTolgeeProvider>
            </ReactQueryClientProvider>
          </OphNextJsThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
