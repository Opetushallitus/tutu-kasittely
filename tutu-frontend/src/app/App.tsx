import { OphThemeProvider } from '@opetushallitus/oph-design-system/theme';
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7';
import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom';

import FilemakerListViewPage from '@/src/app/filemaker/page';
import AsiakirjaPage from '@/src/app/hakemus/asiakirjat/page';
import PaatosEditorPage from '@/src/app/hakemus/editori/paatos/page';
import ViestiPage from '@/src/app/hakemus/editori/viesti/page';
import HakemusLayout from '@/src/app/hakemus/HakemusLayout';
import PaatostiedotPage from '@/src/app/hakemus/paatostiedot/page';
import ApPage from '@/src/app/hakemus/perustelu/ap/page';
import UoroPage from '@/src/app/hakemus/perustelu/uoro/page';
import Lausuntotiedot from '@/src/app/hakemus/perustelu/yleiset/lausunto/page';
import YleisetPage from '@/src/app/hakemus/perustelu/yleiset/perustelut/page';
import PerustietoPage from '@/src/app/hakemus/perustiedot/PerustietoPage';
import TutkintoPage from '@/src/app/hakemus/tutkinnot/page';
import ValitustietoPage from '@/src/app/hakemus/valitustiedot/page';
import YhteinenKasittelyPage from '@/src/app/hakemus/yhteinenkasittely/page';
import MaajakoPage from '@/src/app/maajako/page';
import MainPage from '@/src/app/MainPage';
import TekstipohjatLayout from '@/src/app/tekstipohjat/layout';
import PaatospohjatPage from '@/src/app/tekstipohjat/paatospohjat/page';
import ViestipohjatPage from '@/src/app/tekstipohjat/viestipohjat/page';
import YkPage from '@/src/app/yhteinenKasittely/page';
import { ConfirmationModalProvider } from '@/src/components/ConfirmationModal';
import { AuthorizedUserProvider } from '@/src/components/providers/AuthorizedUserProvider';
import {
  LocalizationProvider,
  MyTolgeeProvider,
} from '@/src/components/providers/LocalizationProvider';
import { LocalizedThemeProvider } from '@/src/components/providers/LocalizedThemeProvider';
import ReactQueryClientProvider from '@/src/components/providers/ReactQueryClientProvider';
import { Toaster } from '@/src/components/Toaster';
import { isTest, raamitUrl } from '@/src/lib/configuration/configuration';
import { ophColors, THEME_OVERRIDES } from '@/src/lib/theme';

const RootLayout = () => {
  useEffect(() => {
    if (!isTest()) {
      const script = document.createElement('script');
      script.src = `${raamitUrl()}`;
      script.async = true;
      document.head.appendChild(script);
      return () => {
        script.remove();
      };
    }
  }, []);
  return (
    <div style={{ backgroundColor: ophColors.grey50 }}>
      <main>
        <NuqsAdapter>
          {/* Initialisoidaan ensin lokalisoimaton teema, jotta ensimmäisten spinnereiden tyylit tulee oikein. */}
          <OphThemeProvider variant="oph" overrides={THEME_OVERRIDES}>
            <ReactQueryClientProvider>
              <MyTolgeeProvider>
                <AuthorizedUserProvider>
                  <LocalizationProvider>
                    <LocalizedThemeProvider>
                      <ConfirmationModalProvider>
                        <Toaster />
                        {/* TODO: tähän väliin vielä navigationGuard*/}
                        <Outlet />
                      </ConfirmationModalProvider>
                    </LocalizedThemeProvider>
                  </LocalizationProvider>
                </AuthorizedUserProvider>
              </MyTolgeeProvider>
            </ReactQueryClientProvider>
          </OphThemeProvider>
        </NuqsAdapter>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter basename="/tutu-frontend">
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<MainPage />}></Route>
          <Route path="/tekstipohjat" element={<TekstipohjatLayout />}>
            <Route path="viestipohjat" element={<ViestipohjatPage />} />
            <Route path="paatospohjat" element={<PaatospohjatPage />} />
          </Route>
          <Route path="/maajako" element={<MaajakoPage />} />
          <Route path="/filemaker" element={<FilemakerListViewPage />} />
          <Route path="/yhteinenKasittely" element={<YkPage />} />
          <Route path="/hakemus/:oid/*" element={<HakemusLayout />}>
            <Route path="perustiedot" element={<PerustietoPage />} />
            <Route path="asiakirjat" element={<AsiakirjaPage />} />
            <Route path="tutkinnot" element={<TutkintoPage />} />
            <Route
              path="perustelu/yleiset/perustelut"
              element={<YleisetPage />}
            />
            <Route
              path="perustelu/yleiset/lausunto"
              element={<Lausuntotiedot />}
            />
            <Route path="perustelu/ap" element={<ApPage />} />
            <Route path="perustelu/uoro" element={<UoroPage />} />
            <Route path="paatostiedot" element={<PaatostiedotPage />} />
            <Route path="valitustiedot" element={<ValitustietoPage />} />
            <Route
              path="yhteinenkasittely"
              element={<YhteinenKasittelyPage />}
            />
            <Route path="editori/viesti" element={<ViestiPage />} />
            <Route path="editori/paatos" element={<PaatosEditorPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
          <Route path="/*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
