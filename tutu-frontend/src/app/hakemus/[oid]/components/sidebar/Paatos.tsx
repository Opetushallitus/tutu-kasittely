import { OphTypography } from '@opetushallitus/oph-design-system';
import React from 'react';
import { PaatosTaydennyspyyntoStack } from '@/src/app/hakemus/[oid]/components/sidebar/PaatosTaydennyspyyntoStack';
import { Stack, useTheme } from '@mui/material';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { StyledLink } from '@/src/app/hakemus/[oid]/components/StyledLink';

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
      <OphTypography variant={'h4'}>
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
    <PaatosTaydennyspyyntoStack gap={theme.spacing(2)}>
      <OphTypography variant={'h4'}>
        {t('hakemus.sivupalkki.paatos.otsikko', '', {
          numero: 1,
        })}
      </OphTypography>
      <AikaisempiPaatos
        t={t}
        asiatunnus="OPH-1234-5678"
        gap={theme.spacing(1)}
      ></AikaisempiPaatos>
    </PaatosTaydennyspyyntoStack>
  );
};
