'use client';

import { PerusteluLayout } from '@/src/app/hakemus/[oid]/perustelu/components/PerusteluLayout';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Stack } from '@mui/material';
import { Muistio } from '@/src/components/Muistio';
import { useHakemus } from '@/src/context/HakemusContext';

export default function UoroPage() {
  const { t } = useTranslations();
  const { hakemus, isLoading, error } = useHakemus();

  return (
    <PerusteluLayout
      showTabs={false}
      title="hakemus.perustelu.uoro.otsikko"
      t={t}
      hakemus={hakemus}
      isHakemusLoading={isLoading}
      hakemusError={error}
    >
      <Stack direction="column" spacing={2}>
        <Muistio
          label={t('hakemus.perustelu.uoro.koulutuksenSisalto')}
          helperText={t('hakemus.perustelu.uoro.koulutuksenSisaltoSelite')}
          hakemus={hakemus}
          sisainen={false}
          hakemuksenOsa={'perustelut-ro-uo'}
        />
      </Stack>
    </PerusteluLayout>
  );
}
