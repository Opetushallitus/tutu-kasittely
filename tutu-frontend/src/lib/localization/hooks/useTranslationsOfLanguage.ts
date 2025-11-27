import { useState, useCallback } from 'react';
import { useTolgee } from '@tolgee/react';

export function useTranslationsOfLanguage(language: string) {
  const tolgee = useTolgee();
  const [loaded, setLoaded] = useState<boolean>(false);

  const ensureLoaded = useCallback(async () => {
    if (!loaded) {
      await tolgee.loadMatrix({
        languages: [language],
        namespaces: ['tutu-kasittely'],
      });
      setLoaded(true);
    }
  }, [language, tolgee, loaded]);

  const tLocal = useCallback(
    async (key: string) => {
      await ensureLoaded();
      return tolgee.t(key, { language });
    },
    [language, ensureLoaded, tolgee],
  );

  return { tLocal };
}
