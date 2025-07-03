import {
  isTesting,
  localTranslations,
  LOKALISOINTI_URL,
  tolgeeTools,
} from '../configuration';
import { BackendFetch, Tolgee } from '@tolgee/react';
import { FormatIcu } from '@tolgee/format-icu';
import { InContextTools } from '@tolgee/web/tools';

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
    const tgWithTools = tolgeeTools ? tg.use(InContextTools()) : tg;
    return tgWithTools
      .use(
        BackendFetch({
          prefix: LOKALISOINTI_URL,
          next: {
            revalidate: REVALIDATE_TIME_SECONDS,
          },
        }),
      )
      .updateDefaults({
        apiKey,
        apiUrl,
        defaultNs: NAMESPACE,
        ns: [NAMESPACE],
        projectId: 11100,
      });
  }
}
