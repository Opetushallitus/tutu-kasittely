import { FormatIcu } from '@tolgee/format-icu';
import { BackendFetch, DevTools, Tolgee } from '@tolgee/react';

import {
  isDev,
  isTest,
  lokalisointiUrl,
  tolgeeApiKey,
  tolgeeApiUrl,
} from '@/src/lib/configuration/configuration';

const NAMESPACE = 'tutu-kasittely';

export function TolgeeBase() {
  const tolgee = Tolgee().use(FormatIcu());

  const defaultSettings = {
    availableLanguages: ['fi', 'sv', 'en'],
    defaultLanguage: 'fi',
    defaultNs: NAMESPACE,
    ns: [NAMESPACE],
  };

  // Testeissä ei haeta käännöksiä verkosta lainkaan. Annetaan tyhjä
  // staticData, jolloin Tolgee latautuu heti ja renderöi käännösavaimet
  // sellaisenaan. Näin Playwright-testit ovat deterministisiä eivätkä riipu
  // lokalisointipalvelusta.
  if (isTest()) {
    return tolgee.updateDefaults({
      ...defaultSettings,
      staticData: {
        [`fi:${NAMESPACE}`]: {},
        [`sv:${NAMESPACE}`]: {},
        [`en:${NAMESPACE}`]: {},
      },
    });
  }

  const apiKey = tolgeeApiKey();
  const apiUrl = tolgeeApiUrl();

  return tolgee
    .use(
      BackendFetch({
        prefix: isDev()
          ? '/lokalisointi/tolgee' // Devi proxyn kautta
          : lokalisointiUrl(),
      }),
    )
    .use(DevTools())
    .updateDefaults(
      apiKey?.trim() && apiUrl?.trim()
        ? { ...defaultSettings, apiKey, apiUrl, projectId: 11100 }
        : defaultSettings,
    );
}
