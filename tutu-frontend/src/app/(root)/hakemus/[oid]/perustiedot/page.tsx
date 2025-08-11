'use client';

import { Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import { LabeledValue } from '@/src/app/(root)/hakemus/[oid]/components/LabeledValue';
import { Muutoshistoria } from '@/src/app/(root)/hakemus/[oid]/components/perustiedot/Muutoshistoria';
import { Henkilotiedot } from '@/src/app/(root)/hakemus/[oid]/components/perustiedot/Henkilotiedot';
import { Sisalto } from '@/src/app/(root)/hakemus/[oid]/components/Sisalto';
import { FullSpinner } from '@/src/components/FullSpinner';
import useToaster from '@/src/hooks/useToaster';
import { useEffect } from 'react';
import { handleFetchError } from '@/src/lib/utils';

const sisallonOsiot = [
  '89e89dff-25b2-4177-b078-fcaf0c9d2589', // Tutkinto tai koulutus
  '0d23f1d1-1aa5-4dcb-9234-28c593441935', // Päätös- ja asiointikieli
  '3781f43c-fff7-47c7-aa7b-66f4a47395a5', // Päätöksen lähettäminen sähköpostilla
  '9e94bfe6-5855-43fc-bd80-d5b74741decb', // Tietojen oikeellisuus ja todistusten aitous
];

export default function PerustietoPage() {
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

  const hakemusKoskee = `valinnat.hakemusKoskeeValinta.${
    hakemusKoskeeOptions.find(
      (option) => option.value === String(hakemus?.hakemusKoskee),
    )?.label || ''
  }`;
  return (
    <Stack gap={theme.spacing(3)}>
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
      <Sisalto osiot={sisallonOsiot} sisalto={hakemus.sisalto} />
      <Stack gap={theme.spacing(3)} width={'60%'}>
        <Muutoshistoria muutosHistoria={hakemus.muutosHistoria} />
        <Henkilotiedot hakija={hakemus.hakija} />
      </Stack>
    </Stack>
  );
}
