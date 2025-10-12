'use client';

import {
  PaatosTieto,
  Paatostyyppi,
  SovellettuLaki,
} from '@/src/lib/types/paatos';
import React, { useEffect, useState } from 'react';
import { OphSelectFormField } from '@opetushallitus/oph-design-system';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  paatostyyppiOptions,
  sovellettuLakiOptions,
} from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { Stack } from '@mui/material';

interface PaatosTietoProps {
  t: TFunction;
  paatosTieto: PaatosTieto;
  updatePaatosTietoAction: (updatedPaatosTieto: PaatosTieto) => void;
}

export const PaatosTietoComponent = ({
  t,
  paatosTieto,
  updatePaatosTietoAction,
}: PaatosTietoProps) => {
  const [currentPaatosTieto, setCurrentPaatosTieto] =
    useState<PaatosTieto>(paatosTieto);

  useEffect(() => {
    setCurrentPaatosTieto(paatosTieto);
  }, [paatosTieto]);

  const handlePaatosTyyppiChange = (paatosTyyppi: Paatostyyppi) => {
    switch (paatosTyyppi) {
      case 'Taso':
      case 'TiettyTutkintoTaiOpinnot':
        updatePaatosTietoAction({
          ...currentPaatosTieto,
          paatosTyyppi: paatosTyyppi,
          sovellettuLaki: 'uo' as SovellettuLaki,
        });
        break;
      case 'Kelpoisuus':
        updatePaatosTietoAction({
          ...currentPaatosTieto,
          paatosTyyppi: paatosTyyppi,
          sovellettuLaki: undefined,
        });
        break;
      case 'RiittavatOpinnot':
        updatePaatosTietoAction({
          ...currentPaatosTieto,
          paatosTyyppi: paatosTyyppi,
          sovellettuLaki: 'ro' as SovellettuLaki,
        });
        break;
    }
  };

  return (
    <Stack direction={'column'} gap={2}>
      <OphSelectFormField
        placeholder={t('yleiset.valitse')}
        label={t('hakemus.paatos.paatostyyppi.otsikko')}
        options={paatostyyppiOptions(t)}
        value={currentPaatosTieto.paatosTyyppi || ''}
        onChange={(event) =>
          handlePaatosTyyppiChange(event.target.value as Paatostyyppi)
        }
        data-testid={'paatos-paatostyyppi-dropdown'}
      />
      <OphSelectFormField
        placeholder={t('yleiset.valitse')}
        label={t('hakemus.paatos.sovellettuLaki.otsikko')}
        options={sovellettuLakiOptions(
          currentPaatosTieto.paatosTyyppi as Paatostyyppi,
          t,
        )}
        value={currentPaatosTieto.sovellettuLaki || ''}
        onChange={(event) =>
          updatePaatosTietoAction({
            ...currentPaatosTieto,
            sovellettuLaki: event.target.value as SovellettuLaki,
          })
        }
        data-testid={'paatos-sovellettulaki-dropdown'}
      />
    </Stack>
  );
};
