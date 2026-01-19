import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import React, { useEffect, useState } from 'react';
import { useTranslationsOfLanguage } from '@/src/lib/localization/hooks/useTranslationsOfLanguage';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import { Language } from '@/src/lib/localization/localizationTypes';
import { HakemusTyyppi } from '@/src/lib/types/hakemus.js';

export const TranslatedHakemuskoskee = ({
  hakemusKoskee,
  kieli,
}: {
  hakemusKoskee: HakemusTyyppi;
  kieli: Language;
}) => {
  const { tAsync } = useTranslationsOfLanguage(kieli);

  const [mitaHakeeTranslated, setMitaHakeeTranslated] = useState('');
  const [hakemusKoskeeTranslated, setHakemusKoskeeTranslated] = useState('');

  useEffect(() => {
    const hakemusKoskeeVal = `valinnat.hakemusKoskeeValinta.${
      hakemusKoskeeOptions.find(
        (option) => option.value === String(hakemusKoskee),
      )?.label ?? ''
    }`;

    tAsync('hakemus.perustiedot.mitaHakee').then(setMitaHakeeTranslated);
    tAsync(hakemusKoskeeVal).then(setHakemusKoskeeTranslated);
  }, [hakemusKoskee, tAsync]);
  return (
    <Box>
      <OphTypography variant={'label'}>{mitaHakeeTranslated}</OphTypography>
      <OphTypography variant={'body1'} data-testid={'hakemus-koskee'}>
        {hakemusKoskeeTranslated}
      </OphTypography>
    </Box>
  );
};
