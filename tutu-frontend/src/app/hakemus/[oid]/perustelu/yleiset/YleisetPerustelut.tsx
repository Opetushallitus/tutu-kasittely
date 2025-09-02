'use client';

import { Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
// import { Muistio } from '@/src/components/Muistio';

import { VirallinenTutkinnonMyontaja } from '@/src/app/hakemus/[oid]/perustelu/yleiset/components/VirallinenTutkinnonMyontaja';
import { VirallinenTutkinto } from '@/src/app/hakemus/[oid]/perustelu/yleiset/components/VirallinenTutkinto';
import { Lahde } from '@/src/app/hakemus/[oid]/perustelu/yleiset/components/Lahde';
import { SelvitysTutkinnonMyontajastaJaVirallisuudesta } from '@/src/app/hakemus/[oid]/perustelu/yleiset/components/SelvitysTutkinnonMyontajastaJaVirallisuudesta';
import { YlimmanTutkinnonAsema } from '@/src/app/hakemus/[oid]/perustelu/yleiset/components/YlimmanTutkinnonAsema';
import { SelvitysTutkinnonAsemasta } from '@/src/app/hakemus/[oid]/perustelu/yleiset/components/SelvitysTutkinnonAsemasta';

export default function YleisetPage() {
  const { t } = useTranslations();
  const theme = useTheme();
  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}
    >
      <OphTypography variant={'h2'}>
        {t('hakemus.perustelu.otsikko')}
      </OphTypography>

      {/* Tabit */}

      <VirallinenTutkinnonMyontaja />
      <VirallinenTutkinto />
      <Lahde />
      <SelvitysTutkinnonMyontajastaJaVirallisuudesta />
      <YlimmanTutkinnonAsema />
      <SelvitysTutkinnonAsemasta />

      {/* Tutkintokohtaiset tiedot */}

      {/* Jatko-opintokelpoisuus ja muut perustelut */}

      {/*
        <Muistio
          label={t('hakemus.perustelut.muistio.sisainenOtsake')}
          hakemus={hakemus}
          sisainen={true}
          hakemuksenOsa={'perustelut-yleiset'}
        />
      */}
    </Stack>
  );
}
