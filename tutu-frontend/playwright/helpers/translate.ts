import { Page } from '@playwright/test';
import {
  CombinedOptions,
  DefaultParamType,
  TranslationKey,
  TolgeeInstance,
} from '@tolgee/react';

type TranslateArgs =
  | [TranslationKey]
  | [TranslationKey, CombinedOptions<DefaultParamType>]
  | [TranslationKey, string, CombinedOptions<DefaultParamType>?];

export async function translate(
  page: Page,
  ...args: TranslateArgs
): Promise<string> {
  // Wait for Tolgee to be initialized
  await page.waitForFunction(
    () => {
      return window._tolgee && window._tolgee.isLoaded();
    },
    {
      polling: 100,
      timeout: 5000,
    },
  );

  const result = await page.evaluate(
    ([params]) => window._tolgee?.t(...params),
    [args as unknown as Parameters<TolgeeInstance['t']>],
  );

  if (result === args[0]) {
    throw new Error(`Translation for key "${args[0]}" not found.`);
  }

  // Should be disabled in testing but some markers still are returned despite trying 'noWrap'
  return result.replace(/[\u200C\u200D]/g, '');
}
