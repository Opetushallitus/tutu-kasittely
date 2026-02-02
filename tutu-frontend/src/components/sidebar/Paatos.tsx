import { Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import React from 'react';

import { StyledLink } from '@/src/components/StyledLink';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';

const AikaisempiPaatos = ({
  t,
  asiatunnus,
  gap,
}: {
  t: TFunction;
  asiatunnus: string;
  gap: string;
}) => {
  return (
    <Stack direction="column" gap={gap}>
      <OphTypography variant={'label'} sx={{ fontWeight: 'bold' }}>
        {t('hakemus.sivupalkki.paatos.otsikkoAikaisempi')}
      </OphTypography>
      <OphTypography variant={'body1'}>
        {t('hakemus.sivupalkki.paatos.seliteAikaisempi')}
      </OphTypography>
      <StyledLink href={'/'}>{asiatunnus}</StyledLink>
    </Stack>
  );
};

export const Paatos = () => {
  const theme = useTheme();
  const { t } = useTranslations();

  return (
    <>
      <OphTypography variant={'label'} sx={{ fontWeight: 'bold' }}>
        {t('hakemus.sivupalkki.paatos.otsikko', '', {
          numero: 1,
        })}
      </OphTypography>
      <AikaisempiPaatos
        t={t}
        asiatunnus="OPH-1234-5678"
        gap={theme.spacing(1)}
      ></AikaisempiPaatos>
    </>
  );
};
