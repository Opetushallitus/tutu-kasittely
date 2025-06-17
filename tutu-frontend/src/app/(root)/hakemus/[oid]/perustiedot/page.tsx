'use client';

import { Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import { LabeledValue } from '@/src/app/(root)/hakemus/[oid]/components/LabeledValue';
import { Muutoshistoria } from '@/src/app/(root)/hakemus/[oid]/perustiedot/Muutoshistoria';
import { Henkilotiedot } from '@/src/app/(root)/hakemus/[oid]/perustiedot/Henkilotiedot';

export default function PerustietoPage() {
  const theme = useTheme();
  const { t } = useTranslations();
  const hakemus = useHakemus().hakemus;
  const hakemusKoskee = `valinnat.hakemusKoskeeValinta.${
    hakemusKoskeeOptions.find(
      (option) => option.value === String(hakemus?.hakemusKoskee),
    )?.label || ''
  }`;
  return (
    <Stack gap={theme.spacing(2)}>
      <OphTypography variant={'h2'}>
        {t('hakemus.perustiedot.otsikko')}
      </OphTypography>
      <OphTypography variant={'h3'}>
        {t('hakemus.perustiedot.hakemusKoskee')}
      </OphTypography>
      <LabeledValue
        label={t('hakemus.perustiedot.mitaHakee')}
        value={t(hakemusKoskee)}
      ></LabeledValue>
      <Muutoshistoria />
      <Henkilotiedot />
    </Stack>
  );
}
