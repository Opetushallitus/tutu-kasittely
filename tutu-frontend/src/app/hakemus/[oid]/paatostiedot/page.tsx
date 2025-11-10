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
import { useEditableState } from '@/src/hooks/useEditableState';
import { SaveRibbon } from '@/src/components/SaveRibbon';

const emptyPaatosTieto = (paatosId: string): PaatosTieto => ({
  id: undefined,
  paatosId: paatosId,
  paatosTyyppi: undefined,
  myonteisenPaatoksenLisavaatimukset: '{}',
  kielteisenPaatoksenPerustelut: undefined,
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
    updateOngoing,
  } = usePaatos(hakemus?.hakemusOid, hakemus?.lomakeId);

  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
    handleFetchError(addToast, paatosError, 'virhe.paatoksenLataus', t);
  }, [addToast, hakemusError, paatosError, t]);

  if (hakemusError || paatosError) {
    return null;
  }

  if (isHakemusLoading || !hakemus || isPaatosLoading || !paatos) {
    return <FullSpinner></FullSpinner>;
  }

  return (
    <Paatostiedot
      paatos={paatos}
      updatePaatos={updatePaatos}
      updateOngoing={updateOngoing}
      hakemus={hakemus!}
    />
  );
}

const Paatostiedot = ({
  paatos,
  updatePaatos,
  updateOngoing,
  hakemus,
}: {
  paatos: Paatos;
  updatePaatos: PaatosUpdateCallback;
  updateOngoing: boolean;
  hakemus: Hakemus;
}) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const [currentPaatos, setCurrentPaatos] = React.useState<Paatos>(paatos);
  const [currentPaatosTiedot, setCurrentPaatosTiedot] = React.useState<
    PaatosTieto[]
  >([]);

  const paatosState = useEditableState(paatos, updatePaatos);

  useEffect(() => {
    setCurrentPaatos(paatos);
    setCurrentPaatosTiedot(
      paatos.paatosTiedot?.length
        ? paatos.paatosTiedot
        : [emptyPaatosTieto(paatos.id!)],
    );
  }, [paatos]);

  const updatePaatosField = (
    updatedPaatos: Partial<Paatos>,
    immediateSave?: boolean,
  ) => {
    const newPaatos: Paatos = { ...currentPaatos, ...updatedPaatos };
    setCurrentPaatos(newPaatos);
    if (immediateSave) {
      paatosState.updateImmediatelly(updatedPaatos);
      return;
    }
    paatosState.updateLocal(newPaatos);
  };

  const updatePaatosTieto = (
    updatedPaatosTieto: PaatosTieto,
    index: number,
    immediateSave?: boolean,
  ) => {
    const newPaatosTiedot = [...currentPaatosTiedot];
    newPaatosTiedot[index] = updatedPaatosTieto;
    setCurrentPaatosTiedot(newPaatosTiedot);
    updatePaatosField({ paatosTiedot: newPaatosTiedot }, immediateSave);
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
    updatePaatosField({ paatosTiedot: newPaatosTiedot }, true);
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
      {currentPaatos.ratkaisutyyppi === 'Paatos' && (
        <>
          <PaatosTietoList
            t={t}
            paatosTiedot={currentPaatosTiedot}
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
      <SaveRibbon
        onSave={paatosState.save}
        isSaving={updateOngoing}
        hasChanges={paatosState.hasChanges}
      />
    </Stack>
  );
};
