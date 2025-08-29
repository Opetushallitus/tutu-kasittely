'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Hakemus, Tutkinto } from '@/src/lib/types/hakemus';
import {
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { Divider, Stack } from '@mui/material';
import { Muistio } from '@/src/components/Muistio';

export type TutkintoProps = {
  tutkinto: Tutkinto;
  hakemus: Hakemus;
  updateTutkintoAction: (tutkinto: Tutkinto) => void;
  t: TFunction;
};

export const MuuTutkintoComponent = ({
  tutkinto,
  hakemus,
  updateTutkintoAction,
  t,
}: TutkintoProps) => {
  const [currentTutkinto, setCurrentTutkinto] =
    React.useState<Tutkinto>(tutkinto);

  const updateCurrentTutkinto = (value: Tutkinto) => {
    updateTutkintoAction(value);
    setCurrentTutkinto(value);
  };

  return (
    <Stack direction="column" gap={2}>
      <OphTypography variant={'h2'} data-testid={'tutkinto-otsikko-MUU'}>
        {t('hakemus.tutkinnot.tutkinto.tutkintoOtsikkoMUU')}
      </OphTypography>
      <OphTypography variant={'label'}>
        {t('hakemus.tutkinnot.tutkinto.muuTutkintoHuomioSelite')}
      </OphTypography>
      <OphInputFormField
        minRows={9}
        multiline={true}
        value={currentTutkinto.muuTutkintoTieto}
        onChange={(event) =>
          updateCurrentTutkinto({
            ...currentTutkinto,
            muuTutkintoTieto: event.target.value,
          })
        }
        data-testid={'tutkinto-tieto-MUU'}
      />
      <Muistio
        label={t('hakemus.tutkinnot.tutkinto.muuTutkintoHuomio')}
        hakemus={hakemus}
        sisainen={false}
        hakemuksenOsa={'tutkinnot_muu_tutkinto_huomio'}
        data-testid={'tutkinto-huomio-MUU'}
      />
      <Divider orientation={'horizontal'} />
    </Stack>
  );
};
