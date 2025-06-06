import {
  isTesting,
  localTranslations,
  LOKALISOINTI_URL,
} from '../configuration';
import { BackendFetch, DevTools, Tolgee } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';

const REVALIDATE_TIME_SECONDS = 10 * 60;

const apiKey = process.env.NEXT_PUBLIC_TOLGEE_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_TOLGEE_API_URL;

const NAMESPACE = 'tutu-kasittely';

export function TolgeeBase() {
  const tg = Tolgee()
    .use(FormatIcu())
    .updateDefaults({
      availableLanguages: ['fi', 'sv', 'en'],
      defaultLanguage: 'fi',
    });

  if (localTranslations || isTesting) {
    return tg.updateDefaults({
      staticData: {
        fi: () => import('./messages/fi.json'),
        sv: () => import('./messages/sv.json'),
        en: () => import('./messages/en.json'),
      },
    });
  } else {
    return tg
      .use(
        BackendFetch({
          prefix: LOKALISOINTI_URL,
          next: {
            revalidate: REVALIDATE_TIME_SECONDS,
          },
        }),
      )
      .use(DevTools())
      .updateDefaults({
        apiKey,
        apiUrl,
        defaultNs: NAMESPACE,
        ns: [NAMESPACE],
        projectId: 11100,
      });
  }
}
