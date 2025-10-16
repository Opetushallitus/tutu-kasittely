'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Hakemus, Tutkinto } from '@/src/lib/types/hakemus';
import {
  OphButton,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';
import { Divider, Stack, Box } from '@mui/material';
import { Muistio } from '@/src/components/Muistio';
import { HakijanIlmoittamaPopover } from './HakijanIlmoittamaPopover';
import { useHakijanIlmoittamaTieto } from '../hooks/useHakijanIlmoittamaTieto';

export type TutkintoProps = {
  tutkinto?: Tutkinto;
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
  const hakijanTieto = useHakijanIlmoittamaTieto(
    hakemus.sisalto,
    'MUU',
    hakemus.lomakkeenKieli,
  );

  const [currentTutkinto, setCurrentTutkinto] = React.useState<
    Tutkinto | undefined
  >(tutkinto);
  const [muuTutkintoAnchorEl, setMuuTutkintoAnchorEl] =
    React.useState<HTMLElement | null>(null);

  useEffect(() => {
    setCurrentTutkinto(tutkinto);
  }, [tutkinto]);

  const updateCurrentTutkinto = (value: Tutkinto) => {
    updateTutkintoAction(value);
    setCurrentTutkinto(value);
  };

  return (
    <Stack direction="column" gap={2}>
      <OphTypography variant={'h3'} data-testid={'tutkinto-otsikko-MUU'}>
        {t('hakemus.tutkinnot.tutkinto.tutkintoOtsikkoMUU')}
      </OphTypography>
      <OphTypography variant={'label'}>
        {t('hakemus.tutkinnot.tutkinto.muuTutkintoHuomioSelite')}
      </OphTypography>
      <Stack direction="column" gap={0.5}>
        <OphInputFormField
          minRows={9}
          multiline={true}
          value={currentTutkinto?.muuTutkintoTieto || ''}
          onChange={(event) =>
            updateCurrentTutkinto({
              ...currentTutkinto,
              hakemusId: currentTutkinto?.hakemusId || '',
              jarjestys: 'MUU',
              muuTutkintoTieto: event.target.value,
            })
          }
          data-testid={'tutkinto-tieto-MUU'}
        />
        <Box>
          <OphButton
            variant="text"
            size="small"
            sx={{
              padding: 0,
              minWidth: 'auto',
              textTransform: 'none',
              color: 'primary.main',
              fontWeight: 400,
            }}
            onClick={(event) => setMuuTutkintoAnchorEl(event.currentTarget)}
            data-testid={'tutkinto-muu-tutkinto-hakijan-ilmoittama-link-MUU'}
          >
            {t('hakemus.tutkinnot.hakijanIlmoittamaTieto.linkki')}
          </OphButton>
        </Box>
      </Stack>
      <Muistio
        label={t('hakemus.tutkinnot.tutkinto.muuTutkintoHuomio')}
        hakemus={hakemus}
        sisainen={false}
        hakemuksenOsa={'tutkinnot_muu_tutkinto_huomio'}
        data-testid={'tutkinto-huomio-MUU'}
      />
      <HakijanIlmoittamaPopover
        anchorEl={muuTutkintoAnchorEl}
        onClose={() => setMuuTutkintoAnchorEl(null)}
        sisalto={hakijanTieto.muuTutkintoTieto}
      />
      <Divider orientation={'horizontal'} />
    </Stack>
  );
};
