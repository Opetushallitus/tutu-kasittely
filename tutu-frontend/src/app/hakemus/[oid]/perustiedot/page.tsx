'use client';

import { Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { hakemusKoskeeOptions } from '@/src/constants/dropdownOptions';
import { LabeledValue } from '@/src/components/LabeledValue';
import { Muutoshistoria } from '@/src/app/hakemus/[oid]/perustiedot/components/Muutoshistoria';
import { Henkilotiedot } from '@/src/app/hakemus/[oid]/perustiedot/components/Henkilotiedot';
import { Sisalto } from '@/src/components/Sisalto';
import { FullSpinner } from '@/src/components/FullSpinner';
import useToaster from '@/src/hooks/useToaster';
import { useEffect } from 'react';
import { handleFetchError } from '@/src/lib/utils';
import {
  asiointiKieli,
  paatosJaAsiointikieli,
  paatosKieli,
  perustietoOsiot,
} from '@/src/constants/hakemuspalveluSisalto';
import { findSisaltoQuestionAndAnswer } from '@/src/lib/hakemuspalveluUtils';

export default function PerustietoPage() {
  const theme = useTheme();
  const { t, getLanguage } = useTranslations();
  const { addToast } = useToaster();
  const { isLoading, hakemus, error } = useHakemus();

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuksenLataus', t);
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

  const [, paatosKieliVal] = findSisaltoQuestionAndAnswer(
    hakemus.sisalto,
    [paatosJaAsiointikieli, paatosKieli],
    getLanguage(),
  );

  const [, asiointiKieliVal] = findSisaltoQuestionAndAnswer(
    hakemus.sisalto,
    [paatosJaAsiointikieli, asiointiKieli],
    getLanguage(),
  );

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
      <Sisalto osiot={perustietoOsiot} sisalto={hakemus.sisalto} />
      <Stack gap={theme.spacing(3)} width={'60%'}>
        <Muutoshistoria muutosHistoria={hakemus.muutosHistoria} />
        <Henkilotiedot
          hakija={hakemus.hakija}
          paatosKieli={paatosKieliVal || ''}
          asiointiKieli={asiointiKieliVal || ''}
        />
      </Stack>
    </Stack>
  );
}
