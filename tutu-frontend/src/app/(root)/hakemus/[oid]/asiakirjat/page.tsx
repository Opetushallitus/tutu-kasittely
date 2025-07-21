'use client';

import { Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { AsiakirjaTaulukko } from '@/src/app/(root)/hakemus/[oid]/components/AsiakirjaTaulukko';
import { FullSpinner } from '@/src/components/FullSpinner';
import { handleFetchError } from '@/src/lib/utils';
import useToaster from '@/src/hooks/useToaster';
import { useEffect } from 'react';

const sisallonOsiot = [
  '89e89dff-25b2-4177-b078-fcaf0c9d2589', // Tutkinto tai koulutus
];

export default function AsiakirjaPage() {
  const theme = useTheme();
  const { t } = useTranslations();
  const { addToast } = useToaster();
  const { isLoading, hakemus, error } = useHakemus();

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuksen-lataus', t);
  }, [error, addToast, t]);

  if (error) {
    return null;
  }

  if (isLoading || !hakemus) return <FullSpinner></FullSpinner>;

  return (
    <Stack gap={theme.spacing(3)} sx={{ flexGrow: 1 }}>
      <OphTypography variant={'h2'}>
        {t('hakemus.asiakirjat.otsikko')}
      </OphTypography>
      <AsiakirjaTaulukko
        osiot={sisallonOsiot}
        sisalto={hakemus.sisalto}
        liitteidenTilat={hakemus.liitteidenTilat}
      />
    </Stack>
  );
}
