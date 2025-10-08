import { isTesting, localTranslations } from '../configuration/configuration';
import { getConfiguration } from '@/src/lib/configuration/clientConfiguration';
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
      defaultNs: NAMESPACE,
      ns: [NAMESPACE],
    });

  if (localTranslations || isTesting) {
    return tg.updateDefaults({
      staticData: {
        'fi:tutu-kasittely': () => import('./messages/fi.json'),
        'sv:tutu-kasittely': () => import('./messages/sv.json'),
        'en:tutu-kasittely': () => import('./messages/en.json'),
      },
    });
  } else {
    return tg
      .use(
        BackendFetch({
          prefix: getConfiguration().LOKALISOINTI_URL,
          next: {
            revalidate: REVALIDATE_TIME_SECONDS,
          },
        }),
      )
      .use(DevTools())
      .updateDefaults({
        apiKey,
        apiUrl,
        projectId: 11100,
      });
  }
}
