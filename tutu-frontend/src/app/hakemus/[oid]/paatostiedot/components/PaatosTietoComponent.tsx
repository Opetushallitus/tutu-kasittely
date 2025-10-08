'use client';

import { PaatosTieto } from '@/src/lib/types/paatos';
import React, { useEffect, useState } from 'react';
import { OphSelectFormField } from '@opetushallitus/oph-design-system';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { paatostyyppiOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';

interface PaatosTietoProps {
  t: TFunction;
  paatosTieto: PaatosTieto;
}

export const PaatosTietoComponent = ({ t, paatosTieto }: PaatosTietoProps) => {
  const [currentPaatosTieto, setCurrentPaatosTieto] =
    useState<PaatosTieto>(paatosTieto);

  useEffect(() => {
    setCurrentPaatosTieto(paatosTieto);
  }, [paatosTieto]);
  console.log(currentPaatosTieto);
  return (
    <OphSelectFormField
      placeholder={t('yleiset.valitse')}
      label={t('hakemus.paatos.paatostyyppi.otsikko')}
      options={paatostyyppiOptions(t)}
      value={''}
      onChange={
        () => null
        // updatePaatosField({
        //   paatosTyyppi: event.target.value as Paatostyyppi,
        // })
      }
      data-testid={'paatos-paatostyyppi'}
    />
  );
};
