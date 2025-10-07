'use client';

import { Divider, Stack, useTheme } from '@mui/material';
import {
  OphCheckbox,
  OphTypography,
  OphSelectFormField,
} from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';
import {
  TFunction,
  useTranslations,
} from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { usePaatos } from '@/src/hooks/usePaatos';
import { FullSpinner } from '@/src/components/FullSpinner';
import { handleFetchError } from '@/src/lib/utils';
import {
  Paatos,
  PaatosUpdateCallback,
  Ratkaisutyyppi,
} from '@/src/lib/types/paatos';
import useToaster from '@/src/hooks/useToaster';
import { PeruutuksenTaiRaukeamisenSyyComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/PeruutuksenTaiRaukeamisenSyyComponent';

const ratkaisutyyppiOptions = (t: TFunction) => [
  { value: 'Paatos', label: t('hakemus.paatos.ratkaisutyyppi.paatos') },
  {
    value: 'PeruutusTaiRaukeaminen',
    label: t('hakemus.paatos.ratkaisutyyppi.peruutusTaiRaukeaminen'),
  },
  { value: 'Oikaisu', label: t('hakemus.paatos.ratkaisutyyppi.oikaisu') },
  {
    value: 'JatetaanTutkimatta',
    label: t('hakemus.paatos.ratkaisutyyppi.jatetaanTutkimatta'),
  },
  { value: 'Siirto', label: t('hakemus.paatos.ratkaisutyyppi.siirto') },
];

const paatostyyppiOptions = (t: TFunction) => [
  { value: 'Taso', label: t('hakemus.paatos.paatostyyppi.taso') },
  {
    value: 'Kelpoisuus',
    label: t('hakemus.paatos.paatostyyppi.kelpoisuus'),
  },
  {
    value: 'TiettyTutkintoTaiOpinnot',
    label: t('hakemus.paatos.paatostyyppi.tiettyTutkintoTaiOpinnot'),
  },
  {
    value: 'RiittavatOpinnot',
    label: t('hakemus.paatos.paatostyyppi.riittavatOpinnot'),
  },
];

export default function PaatostiedotPage() {
  const { t } = useTranslations();
  const {
    isLoading: isHakemusLoading,
    hakemus,
    error: hakemusError,
  } = useHakemus();
  const {
    isPaatosLoading,
    paatos,
    error: paatosError,
    updatePaatos,
    updateOngoing,
  } = usePaatos(hakemus?.hakemusOid);
  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
    handleFetchError(addToast, paatosError, 'virhe.paatoksenLataus', t);
  }, [addToast, hakemusError, paatosError, t]);

  if (hakemusError || paatosError || !paatos) {
    return null;
  }

  if (isHakemusLoading || isPaatosLoading) {
    return <FullSpinner></FullSpinner>;
  }

  return (
    <Paatostiedot
      paatos={paatos}
      updatePaatos={updatePaatos}
      updateOngoing={updateOngoing}
    />
  );
}

const Paatostiedot = ({
  paatos,
  updatePaatos,
  updateOngoing,
}: {
  paatos: Paatos;
  updatePaatos: PaatosUpdateCallback;
  updateOngoing: boolean;
}) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const [currentPaatos, setCurrentPaatos] = React.useState<Paatos>(paatos);

  useEffect(() => {
    setCurrentPaatos(paatos);
  }, [paatos]);

  const updatePaatosField = (updatedPaatos: Partial<Paatos>) => {
    const newPaatos: Paatos = { ...currentPaatos, ...updatedPaatos };
    setCurrentPaatos(newPaatos);
    if (!updateOngoing) {
      updatePaatos(newPaatos);
    }
  };
  console.log({ currentPaatos });
  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
        <OphTypography variant={'h2'}>
          {t('hakemus.paatos.otsikko')}
        </OphTypography>
      </Stack>
      <Divider />
      <OphTypography variant={'h3'}>
        {t('hakemus.paatos.ratkaisuJaPaatos')}
      </OphTypography>
      <OphCheckbox
        label={t('hakemus.paatos.seut')}
        checked={currentPaatos.seutArviointi}
        onChange={() => {
          updatePaatosField({ seutArviointi: !currentPaatos.seutArviointi });
        }}
        data-testid={'paatos-seut'}
      />
      <OphSelectFormField
        placeholder={t('yleiset.valitse')}
        label={t('hakemus.paatos.ratkaisutyyppi.otsikko')}
        options={ratkaisutyyppiOptions(t)}
        value={currentPaatos.ratkaisutyyppi || ''}
        onChange={(event) =>
          updatePaatosField({
            ratkaisutyyppi: event.target.value as Ratkaisutyyppi,
          })
        }
        data-testid={'paatos-ratkaisutyyppi'}
      />
      {currentPaatos.ratkaisutyyppi === 'PeruutusTaiRaukeaminen' && (
        <PeruutuksenTaiRaukeamisenSyyComponent
          t={t}
          theme={theme}
          syy={currentPaatos.peruutuksenTaiRaukeamisenSyy}
          updatePeruutuksenTaiRaukeamisenSyy={(syy) =>
            updatePaatosField({ peruutuksenTaiRaukeamisenSyy: syy })
          }
        />
      )}
      {currentPaatos.ratkaisutyyppi === 'Paatos' && (
        //todo: omaksi komponentiksi
        <OphSelectFormField
          placeholder={t('yleiset.valitse')}
          label={t('hakemus.paatos.paatostyyppi.otsikko')}
          options={paatostyyppiOptions(t)}
          value={''}
          onChange={
            () => null
            // updatePaatosField({
            //   paatosTyyppi: event.target.value as Paatostyyppi,
            // })
          }
          data-testid={'paatos-paatostyyppi'}
        />
      )}
    </Stack>
  );
};
