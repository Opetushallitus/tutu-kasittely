'use client';

import {
  getConfiguration,
  setConfiguration,
} from '@/src/lib/configuration/clientConfiguration';
import { type Configuration } from '@/src/lib/configuration/configuration';
import { createContext, useEffect, useState, type ReactNode } from 'react';
import { isNullish } from 'remeda';

export const ConfigurationContext = createContext<{
  configuration: null | Configuration;
}>({ configuration: null });

export function ConfigurationProvider({
  configuration,
  children,
}: {
  configuration: Configuration;
  children: ReactNode;
}) {
  const [clientConfiguration, setClientConfiguration] =
    useState<Configuration | null>(null);

  useEffect(() => {
    setConfiguration(configuration);
    setClientConfiguration(getConfiguration());
  }, [configuration]);

  return isNullish(clientConfiguration) ? null : (
    <ConfigurationContext value={{ configuration: clientConfiguration }}>
      {children}
    </ConfigurationContext>
  );
}
