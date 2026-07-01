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

const isTestingOrDev = isTest() || isDev();

export function TolgeeBase() {
  return Tolgee()
    .use(FormatIcu())
    .use(
      BackendFetch({
        prefix: isTestingOrDev
          ? '/lokalisointi/tolgee' // Devi proxyn kautta
          : lokalisointiUrl(),
      }),
    )
    .use(isTest() ? undefined : DevTools())
    .updateDefaults({
      availableLanguages: ['fi', 'sv', 'en'],
      defaultLanguage: 'fi',
      defaultNs: NAMESPACE,
      ns: [NAMESPACE],
      apiKey: tolgeeApiKey(),
      apiUrl: tolgeeApiUrl(),
      projectId: 11100,
    });
}
