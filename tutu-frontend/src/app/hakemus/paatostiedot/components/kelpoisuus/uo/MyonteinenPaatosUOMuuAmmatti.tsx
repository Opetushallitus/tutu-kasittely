import React from 'react';

import { Tilannekuvaus } from '@/src/app/hakemus/paatostiedot/components/Tilannekuvaus';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import {
  KelpoisuudenLisavaatimukset,
  KelpoisuudenLisavaatimusUpdateCallback,
} from '@/src/lib/types/paatos';

type MyonteinenPaatosUOMuuAmmattiProps = {
  lisavaatimukset?: KelpoisuudenLisavaatimukset | null;
  updateLisavaatimukset: KelpoisuudenLisavaatimusUpdateCallback;
};

export const MyonteinenPaatosUOMuuAmmatti: React.FC<
  MyonteinenPaatosUOMuuAmmattiProps
> = ({
  updateLisavaatimukset,
  lisavaatimukset,
}: MyonteinenPaatosUOMuuAmmattiProps) => {
  const { t } = useTranslations();

  return (
    <Tilannekuvaus
      t={t}
      value={lisavaatimukset?.muuAmmattiTilannekuvaus}
      onChange={(value) =>
        updateLisavaatimukset({
          muuAmmattiTilannekuvaus: value,
        })
      }
      testId={`muuAmmattiTilannekuvaus-input`}
    />
  );
};
