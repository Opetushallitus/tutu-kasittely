'use client';

import { Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { useLiitteet } from '@/src/hooks/useLiitteet';
import {
  AsiakirjaTaulukko,
  haeAsiakirjat,
} from '@/src/app/(root)/hakemus/[oid]/components/AsiakirjaTaulukko';
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

  /* -------------------------- */
  /* Haetaan hakemuksen  tiedot */
  const {
    isLoading: hakemusIsLoading,
    hakemus,
    error: hakemusError,
  } = useHakemus();

  /* -------------------------- */
  /* Haetaan liitteiden  tiedot */
  const sisalto = hakemus?.sisalto || [];
  const rajattuSisalto = sisalto.filter((item) =>
    sisallonOsiot.includes(item.key),
  );
  const asiakirjat = haeAsiakirjat(rajattuSisalto);

  const {
    isLoading: asiakirjatIsLoading,
    data: asiakirjaMetadata,
    error: asiakirjaError,
  } = useLiitteet(asiakirjat.map((asiakirja) => asiakirja.label.fi).join(','));

  /* ----------------------------------------- */
  /* Käsitellään virheet ja puutteellinen data */
  useEffect(() => {
    handleFetchError(addToast, asiakirjaError, 'virhe.liitteiden-lataus', t);
  }, [asiakirjaError, addToast, t]);

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksen-lataus', t);
  }, [hakemusError, addToast, t]);

  if (hakemusError || asiakirjaError) {
    return null;
  }

  if (hakemusIsLoading || !hakemus || asiakirjatIsLoading || !asiakirjaMetadata)
    return <FullSpinner></FullSpinner>;

  /* ------------------------------- */
  /* Yhdistetään asiakirjojen tiedot */
  const completeAsiakirjaData = asiakirjat.map((asiakirja) => {
    const metadata = asiakirjaMetadata.find(
      (dataItem) => dataItem.key === asiakirja.label.fi,
    );
    const liitteenTila = hakemus.liitteidenTilat.find(
      (state) => state.attachment === asiakirja.formId,
    );
    return { asiakirja, metadata, liitteenTila, key: asiakirja.label.fi };
  });

  return (
    <Stack gap={theme.spacing(3)} sx={{ flexGrow: 1 }}>
      <OphTypography variant={'h2'}>
        {t('hakemus.asiakirjat.otsikko')}
      </OphTypography>
      <AsiakirjaTaulukko asiakirjat={completeAsiakirjaData} />
    </Stack>
  );
}
