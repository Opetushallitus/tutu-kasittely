import { Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import React, { useEffect, useState } from 'react';
import { useTranslationsOfLanguage } from '@/src/lib/localization/hooks/useTranslationsOfLanguage';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import { Language } from '@/src/lib/localization/localizationTypes';

export const TranslatedHakemuskoskee = ({
  hakemusKoskee,
  kieli,
}: {
  hakemusKoskee: number;
  kieli: Language;
}) => {
  const { tLocal } = useTranslationsOfLanguage(kieli);

  const [mitaHakeeTranslated, setMitaHakeeTranslated] = useState('');
  const [hakemusKoskeeTranslated, setHakemusKoskeeTranslated] = useState('');

  useEffect(() => {
    const hakemusKoskeeVal = `valinnat.hakemusKoskeeValinta.${
      hakemusKoskeeOptions.find(
        (option) => option.value === String(hakemusKoskee),
      )?.label ?? ''
    }`;

    tLocal('hakemus.perustiedot.mitaHakee').then(setMitaHakeeTranslated);
    tLocal(hakemusKoskeeVal).then(setHakemusKoskeeTranslated);
  }, [hakemusKoskee, tLocal]);
  return (
    <Box>
      <OphTypography variant={'label'}>{mitaHakeeTranslated}</OphTypography>
      <OphTypography variant={'body1'} data-testid={'hakemus-koskee'}>
        {hakemusKoskeeTranslated}
      </OphTypography>
    </Box>
  );
};
