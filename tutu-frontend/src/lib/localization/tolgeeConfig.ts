import { FormatIcu } from '@tolgee/format-icu';
import { BackendFetch, DevTools, Tolgee } from '@tolgee/react';

import { getConfiguration } from '@/src/lib/configuration/clientConfiguration';

import { isTesting } from '../configuration/configuration';

const REVALIDATE_TIME_SECONDS = 10 * 60;

const apiKey = process.env.NEXT_PUBLIC_TOLGEE_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_TOLGEE_API_URL;

const NAMESPACE = 'tutu-kasittely';

export function TolgeeBase() {
  return (
    Tolgee()
      .use(FormatIcu())
      .use(
        BackendFetch({
          prefix: isTesting
            ? `${process.env.APP_URL}/lokalisointi/tolgee` // Devi proxyn kautta
            : getConfiguration().LOKALISOINTI_URL,
          next: {
            revalidate: REVALIDATE_TIME_SECONDS,
          },
        }),
      )
      .use(isTesting ? undefined : DevTools())
      //.use(DevTools())
      .updateDefaults({
        availableLanguages: ['fi', 'sv', 'en'],
        defaultLanguage: 'fi',
        defaultNs: NAMESPACE,
        ns: [NAMESPACE],
        apiKey,
        apiUrl,
        projectId: 11100,
      })
  );
}
