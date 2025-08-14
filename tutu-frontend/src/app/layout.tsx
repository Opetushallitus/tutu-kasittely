import type { Metadata } from 'next';
import Script from 'next/script';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { OphNextJsThemeProvider } from '@opetushallitus/oph-design-system/next/theme';
import {
  LocalizationProvider,
  MyTolgeeProvider,
} from '@/src/components/providers/LocalizationProvider';
import { ophColors, THEME_OVERRIDES } from '@/src/lib/theme';
import { LocalizedThemeProvider } from '@/src/components/providers/LocalizedThemeProvider';
import ReactQueryClientProvider from '@/src/components/providers/ReactQueryClientProvider';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ReactNode } from 'react';
import { AuthorizedUserProvider } from '@/src/components/providers/AuthorizedUserProvider';
import { Toaster } from '@/src/components/Toaster';
import { ConfigurationProvider } from '@/src/components/providers/ConfigurationProvider';
import { buildConfiguration } from '@/src/lib/configuration/serverConfiguration';

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
      <Script src={config.RAAMIT_URL} />
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
                            <Toaster />
                            {children}
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
