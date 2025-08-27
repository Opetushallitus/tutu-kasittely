'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Tutkinto } from '@/src/lib/types/hakemus';
import {
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { Divider, Stack } from '@mui/material';

export type TutkintoProps = {
  tutkinto: Tutkinto;
  updateTutkintoAction: (tutkinto: Tutkinto) => void;
  t: TFunction;
};

export const MuuTutkintoComponent = ({
  tutkinto,
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
      <OphInputFormField
        minRows={9}
        multiline={true}
        label={t('hakemus.tutkinnot.tutkinto.tutkintoOtsikkoMUU')}
        value={currentTutkinto.muuTutkintoTieto}
        onChange={(event) =>
          updateCurrentTutkinto({
            ...currentTutkinto,
            muuTutkintoTieto: event.target.value,
          })
        }
        data-testid={'tutkinto-tieto-MUU'}
      />
      <OphTypography variant={'h2'}>
        {t('hakemus.tutkinnot.tutkinto.muuTutkintoHuomio')}
      </OphTypography>
      <OphTypography variant={'body1'}>
        {t('hakemus.tutkinnot.tutkinto.muuTutkintoHuomioSelite')}
      </OphTypography>
      <OphInputFormField
        minRows={5}
        multiline={true}
        value={'TODO muu tutkintohuomio'}
        // onChange={(event) => null}
        data-testid={'tutkinto-huomio-MUU'}
      />
      <Divider orientation={'horizontal'} />
    </Stack>
  );
};
