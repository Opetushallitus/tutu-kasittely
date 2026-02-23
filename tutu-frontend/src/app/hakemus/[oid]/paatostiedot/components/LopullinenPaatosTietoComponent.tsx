'use client';

import { Stack } from '@mui/material';
import { OphSelectFormField } from '@opetushallitus/oph-design-system';
import React, { useEffect, useState } from 'react';

import { LopullinenKelpoisuusList } from '@/src/app/hakemus/[oid]/paatostiedot/components/kelpoisuus/LopullinenKelpoisuusList';
import { sovellettuLakiOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { PaatosTieto, SovellettuLaki } from '@/src/lib/types/paatos';

interface LopullinenPaatosTietoProps {
  t: TFunction;
  paatosTieto: PaatosTieto;
  updatePaatosTietoAction: (
    updatedPaatosTieto: PaatosTieto,
    immediateSave?: boolean,
  ) => void;
}

export const LopullinenPaatosTietoComponent = ({
  t,
  paatosTieto,
  updatePaatosTietoAction,
}: LopullinenPaatosTietoProps) => {
  const [currentPaatosTieto, setCurrentPaatosTieto] =
    useState<PaatosTieto>(paatosTieto);

  useEffect(() => {
    setCurrentPaatosTieto(paatosTieto);
  }, [paatosTieto]);

  const handleSovellettuLakiChange = (sovellettuLaki: string) => {
    updatePaatosTietoAction({
      ...currentPaatosTieto,
      sovellettuLaki: sovellettuLaki as SovellettuLaki,
      paatosTyyppi: 'LopullinenPaatos',
    });
  };

  return (
    <Stack direction={'column'} gap={2}>
      <OphSelectFormField
        placeholder={t('yleiset.valitse')}
        label={t('hakemus.paatos.sovellettuLaki.otsikko')}
        options={sovellettuLakiOptions('LopullinenPaatos', t)}
        value={currentPaatosTieto.sovellettuLaki || ''}
        onChange={(event) => handleSovellettuLakiChange(event.target.value)}
        data-testid={'paatos-sovellettulaki-dropdown'}
        inputProps={{
          'aria-label': t('hakemus.paatos.sovellettuLaki.otsikko'),
        }}
      />
      {currentPaatosTieto.sovellettuLaki && (
        <LopullinenKelpoisuusList
          t={t}
          paatosTieto={currentPaatosTieto}
          updatePaatosTietoAction={updatePaatosTietoAction}
        />
      )}
    </Stack>
  );
};
