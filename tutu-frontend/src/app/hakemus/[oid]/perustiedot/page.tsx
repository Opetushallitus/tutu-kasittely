'use client';

import { Box, Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import { Henkilotiedot } from '@/src/app/hakemus/[oid]/perustiedot/components/Henkilotiedot';
import { Sisalto } from '@/src/app/hakemus/[oid]/perustiedot/components/Sisalto';
import { FullSpinner } from '@/src/components/FullSpinner';
import useToaster from '@/src/hooks/useToaster';
import React, { useEffect } from 'react';
import { handleFetchError } from '@/src/lib/utils';
import {
  asiointiKieli,
  paatosJaAsiointikieli,
  paatosKieli,
  perustietoOsiot,
} from '@/src/constants/hakemuspalveluSisalto';
import { findSisaltoQuestionAndAnswer } from '@/src/lib/hakemuspalveluUtils';
import { Muistio } from '@/src/components/Muistio';
import { TranslatedName } from '@/src/lib/localization/localizationTypes';

export default function PerustietoPage() {
  const theme = useTheme();
  const { t } = useTranslations();
  const { addToast } = useToaster();
  const {
    isLoading,
    hakemusState: { editedData: hakemus },
    error,
  } = useHakemus();

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuksenLataus', t);
  }, [error, addToast, t]);

  if (error) {
    return null;
  }

  if (isLoading || !hakemus) return <FullSpinner></FullSpinner>;

  const hakemusKoskee = `valinnat.hakemusKoskeeValinta.${
    hakemusKoskeeOptions.find(
      (option) => option.value === String(hakemus?.hakemusKoskee),
    )?.label || ''
  }`;

  const [, paatosKieliVal] = findSisaltoQuestionAndAnswer(
    hakemus.sisalto,
    [paatosJaAsiointikieli, paatosKieli],
    hakemus.lomakkeenKieli as keyof TranslatedName,
  );

  const [, asiointiKieliVal] = findSisaltoQuestionAndAnswer(
    hakemus.sisalto,
    [paatosJaAsiointikieli, asiointiKieli],
    hakemus.lomakkeenKieli as keyof TranslatedName,
  );

  return (
    <Stack gap={theme.spacing(2)} sx={{ marginRight: theme.spacing(3) }}>
      <OphTypography variant={'h2'}>
        {t('hakemus.perustiedot.otsikko')}
      </OphTypography>
      <OphTypography variant={'h3'}>
        {t('hakemus.perustiedot.hakemusKoskee')}
      </OphTypography>
      <Box>
        <OphTypography variant={'label'}>
          {t(`hakemus.perustiedot.mitaHakee.${hakemus.lomakkeenKieli}`)}
        </OphTypography>
        <OphTypography variant={'body1'} data-testid={'hakemus-koskee'}>
          {t(`${hakemusKoskee}.${hakemus.lomakkeenKieli}`)}
        </OphTypography>
      </Box>
      <Sisalto
        osiot={perustietoOsiot}
        sisalto={hakemus.sisalto}
        lomakkeenKieli={hakemus.lomakkeenKieli}
      />
      <Muistio
        label={t('hakemus.perustiedot.esittelijanHuomioita')}
        hakemus={hakemus}
        sisainen={true}
        hakemuksenOsa={'asiakirjat'}
      />
      <Stack gap={theme.spacing(3)} width={'60%'}>
        <Henkilotiedot
          hakija={hakemus.hakija}
          paatosKieli={paatosKieliVal || ''}
          asiointiKieli={asiointiKieliVal || ''}
        />
      </Stack>
    </Stack>
  );
}
