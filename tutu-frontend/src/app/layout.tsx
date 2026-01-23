import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { OphNextJsThemeProvider } from '@opetushallitus/oph-design-system/next/theme';
import Script from 'next/script';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ReactNode } from 'react';

import { ConfirmationModalProvider } from '@/src/components/ConfirmationModal';
import { AuthorizedUserProvider } from '@/src/components/providers/AuthorizedUserProvider';
import { ConfigurationProvider } from '@/src/components/providers/ConfigurationProvider';
import {
  LocalizationProvider,
  MyTolgeeProvider,
} from '@/src/components/providers/LocalizationProvider';
import { LocalizedThemeProvider } from '@/src/components/providers/LocalizedThemeProvider';
import ReactQueryClientProvider from '@/src/components/providers/ReactQueryClientProvider';
import { Toaster } from '@/src/components/Toaster';
import { isTesting } from '@/src/lib/configuration/configuration';
import { buildConfiguration } from '@/src/lib/configuration/serverConfiguration';
import { ophColors, THEME_OVERRIDES } from '@/src/lib/theme';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tutkintojen tunnustaminen',
  description: 'Tutkintojen tunnustamisen hakemusten käsittelyn käyttöliittymä',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const config = await buildConfiguration();

  return (
    <html lang="fi">
      {!isTesting && <Script src={config.RAAMIT_URL} />}
      <body
        style={{
          backgroundColor: ophColors.grey50,
        }}
      >
        <main>
          <NuqsAdapter>
            <AppRouterCacheProvider>
              {/* Initialisoidaan ensin lokalisoimaton teema, jotta ensimmäisten spinnereiden tyylit tulee oikein. */}
              <OphNextJsThemeProvider variant="oph" overrides={THEME_OVERRIDES}>
                <ReactQueryClientProvider>
                  <ConfigurationProvider configuration={config}>
                    <MyTolgeeProvider>
                      <AuthorizedUserProvider>
                        <LocalizationProvider>
                          <LocalizedThemeProvider>
                            <ConfirmationModalProvider>
                              <Toaster />
                              {children}
                            </ConfirmationModalProvider>
                          </LocalizedThemeProvider>
                        </LocalizationProvider>
                      </AuthorizedUserProvider>
                    </MyTolgeeProvider>
                  </ConfigurationProvider>
                </ReactQueryClientProvider>
              </OphNextJsThemeProvider>
            </AppRouterCacheProvider>
          </NuqsAdapter>
        </main>
      </body>
    </html>
  );
}
