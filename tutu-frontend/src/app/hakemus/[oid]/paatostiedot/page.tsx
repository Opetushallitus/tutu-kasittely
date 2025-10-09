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
import { PaatosTietoComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosTietoComponent';
import { ratkaisutyyppiOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { Add, DeleteOutline } from '@mui/icons-material';

const emptyPaatosTieto = (paatosId: string): PaatosTieto => ({
  id: undefined,
  paatosId: paatosId,
  paatosTyyppi: undefined,
  myonteisenPaatoksenLisavaatimukset: '{}',
  kielteisenPaatoksenPerustelut: '{}',
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
  const [currentPaatosTiedot, setCurrentPaatosTiedot] = React.useState<
    PaatosTieto[]
  >([]);

  useEffect(() => {
    setCurrentPaatos(paatos);
    setCurrentPaatosTiedot(
      paatos.paatosTiedot?.length
        ? paatos.paatosTiedot
        : [emptyPaatosTieto(paatos.id!)],
    );
  }, [paatos]);

  console.log(currentPaatosTiedot);
  const updatePaatosField = (updatedPaatos: Partial<Paatos>) => {
    const newPaatos: Paatos = { ...currentPaatos, ...updatedPaatos };
    setCurrentPaatos(newPaatos);
    if (!updateOngoing) {
      updatePaatos(newPaatos);
    }
  };

  const updatePaatosTieto = (
    updatedPaatosTieto: PaatosTieto,
    index: number,
  ) => {
    const newPaatosTiedot = [...currentPaatosTiedot];
    newPaatosTiedot[index] = updatedPaatosTieto;
    setCurrentPaatosTiedot(newPaatosTiedot);
    updatePaatosField({ paatosTiedot: newPaatosTiedot });
  };

  const addPaatosTieto = () => {
    setCurrentPaatosTiedot((oldPaatosTiedot) =>
      oldPaatosTiedot.concat([emptyPaatosTieto(paatos.id!)]),
    );
  };

  const deletePaatosTieto = (id: string | undefined) => {
    const newPaatosTiedot = id
      ? currentPaatosTiedot.filter((paatostieto) => paatostieto.id !== id)
      : currentPaatosTiedot.slice(0, -1);
    setCurrentPaatosTiedot(newPaatosTiedot);
    updatePaatosField({ paatosTiedot: newPaatosTiedot });
  };

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
      {currentPaatos.ratkaisutyyppi === 'Paatos' &&
        currentPaatosTiedot.map((paatosTieto, index) => (
          <Stack key={index} direction={'column'} gap={theme.spacing(2)}>
            <Stack
              key={`stack-${index}`}
              direction={'row'}
              gap={theme.spacing(2)}
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <OphTypography variant={'h3'}>
                {t('hakemus.paatos.paatostyyppi.paatos')} {index + 1}
              </OphTypography>
              {index > 0 && (
                <OphButton
                  sx={{
                    alignSelf: 'flex-end',
                  }}
                  data-testid={`poista-paatos-button`}
                  variant="text"
                  startIcon={<DeleteOutline />}
                  onClick={() => deletePaatosTieto(paatosTieto.id)}
                >
                  {t('hakemus.paatos.paatostyyppi.poistaPaatos')}
                </OphButton>
              )}
            </Stack>
            <PaatosTietoComponent
              key={index}
              t={t}
              paatosTieto={paatosTieto}
              updatePaatosTietoAction={(updated) =>
                updatePaatosTieto(updated, index)
              }
            />
            <Divider />
          </Stack>
        ))}
      {currentPaatos.ratkaisutyyppi === 'Paatos' && (
        <>
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
