'use client';

import { Divider, Stack, useTheme } from '@mui/material';
import {
  OphCheckbox,
  OphTypography,
  OphSelectFormField,
  OphButton,
} from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { useHakemus } from '@/src/context/HakemusContext';
import { usePaatos } from '@/src/hooks/usePaatos';
import { FullSpinner } from '@/src/components/FullSpinner';
import { handleFetchError } from '@/src/lib/utils';
import {
  Paatos,
  PaatosTieto,
  PaatosUpdateCallback,
  Ratkaisutyyppi,
} from '@/src/lib/types/paatos';
import useToaster from '@/src/hooks/useToaster';
import { PeruutuksenTaiRaukeamisenSyyComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/PeruutuksenTaiRaukeamisenSyyComponent';
import { ratkaisutyyppiOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { Add } from '@mui/icons-material';
import { PaatosTietoList } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosTietoList';
import { Hakemus } from '@/src/lib/types/hakemus';
import { PaatosHeader } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosHeader';

const emptyPaatosTieto = (paatosId: string): PaatosTieto => ({
  id: undefined,
  paatosId: paatosId,
  paatosTyyppi: undefined,
  myonteisenPaatoksenLisavaatimukset: '{}',
  kielteisenPaatoksenPerustelut: '{}',
  rinnastettavatTutkinnotTaiOpinnot: [],
  kelpoisuudet: [],
});

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
  } = usePaatos(hakemus?.hakemusOid, hakemus?.lomakeId);
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
      hakemus={hakemus!}
    />
  );
}

const Paatostiedot = ({
  paatos,
  updatePaatos,
  hakemus,
}: {
  paatos: Paatos;
  updatePaatos: PaatosUpdateCallback;
  hakemus: Hakemus;
}) => {
  const { t } = useTranslations();
  const theme = useTheme();

  // No local state - use query data directly (matches Perustelu pattern)
  const paatosTiedot = paatos.paatosTiedot?.length
    ? paatos.paatosTiedot
    : [emptyPaatosTieto(paatos.id!)];

  const updatePaatosField = (updatedPaatos: Partial<Paatos>) => {
    const newPaatos: Paatos = { ...paatos, ...updatedPaatos };
    updatePaatos(newPaatos);
  };

  const updatePaatosTieto = (
    updatedPaatosTieto: PaatosTieto,
    index: number,
  ) => {
    const newPaatosTiedot = [...paatosTiedot];
    newPaatosTiedot[index] = updatedPaatosTieto;
    updatePaatosField({ paatosTiedot: newPaatosTiedot });
  };

  const addPaatosTieto = () => {
    const newPaatosTiedot = [...paatosTiedot, emptyPaatosTieto(paatos.id!)];
    updatePaatosField({ paatosTiedot: newPaatosTiedot });
  };

  const deletePaatosTieto = (id: string | undefined) => {
    const newPaatosTiedot = id
      ? paatosTiedot.filter((paatostieto) => paatostieto.id !== id)
      : paatosTiedot.slice(0, -1);
    updatePaatosField({ paatosTiedot: newPaatosTiedot });
  };

  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}
    >
      <PaatosHeader
        paatos={paatos}
        updatePaatosField={updatePaatosField}
        t={t}
      />
      <Divider />
      <OphTypography variant={'h3'}>
        {t('hakemus.paatos.ratkaisuJaPaatos')}
      </OphTypography>
      <OphCheckbox
        label={t('hakemus.paatos.seut')}
        checked={paatos.seutArviointi}
        onChange={() => {
          updatePaatosField({ seutArviointi: !paatos.seutArviointi });
        }}
        data-testid={'paatos-seut'}
      />
      <OphSelectFormField
        placeholder={t('yleiset.valitse')}
        label={t('hakemus.paatos.ratkaisutyyppi.otsikko')}
        options={ratkaisutyyppiOptions(t)}
        value={paatos.ratkaisutyyppi || ''}
        onChange={(event) =>
          updatePaatosField(
            (event.target.value as Ratkaisutyyppi) !== 'Paatos'
              ? {
                  ratkaisutyyppi: event.target.value as Ratkaisutyyppi,
                  paatosTiedot: [],
                }
              : { ratkaisutyyppi: event.target.value as Ratkaisutyyppi },
          )
        }
        data-testid={'paatos-ratkaisutyyppi'}
      />
      {paatos.ratkaisutyyppi === 'PeruutusTaiRaukeaminen' && (
        <PeruutuksenTaiRaukeamisenSyyComponent
          t={t}
          theme={theme}
          syy={paatos.peruutuksenTaiRaukeamisenSyy}
          updatePeruutuksenTaiRaukeamisenSyy={(syy) =>
            updatePaatosField({ peruutuksenTaiRaukeamisenSyy: syy })
          }
        />
      )}
      {paatos.ratkaisutyyppi === 'Paatos' && (
        <>
          <PaatosTietoList
            t={t}
            paatosTiedot={paatosTiedot}
            paatosTietoOptions={paatos.paatosTietoOptions}
            updatePaatosTietoAction={updatePaatosTieto}
            deletePaatosTieto={deletePaatosTieto}
            tutkinnot={hakemus.tutkinnot}
          />
          <OphButton
            sx={{
              alignSelf: 'flex-start',
            }}
            data-testid={`lisaa-paatos-button`}
            variant="outlined"
            startIcon={<Add />}
            onClick={addPaatosTieto}
          >
            {t('hakemus.paatos.paatostyyppi.lisaaPaatos')}
          </OphButton>
          <Divider />
        </>
      )}
    </Stack>
  );
};
