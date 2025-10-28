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
import { useEditableState } from '@/src/hooks/useEditableState';
import { FullSpinner } from '@/src/components/FullSpinner';
import { handleFetchError } from '@/src/lib/utils';
import { Paatos, PaatosTieto, Ratkaisutyyppi } from '@/src/lib/types/paatos';
import useToaster from '@/src/hooks/useToaster';
import { PeruutuksenTaiRaukeamisenSyyComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/PeruutuksenTaiRaukeamisenSyyComponent';
import { ratkaisutyyppiOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import { Add } from '@mui/icons-material';
import { PaatosTietoList } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosTietoList';
import { Hakemus } from '@/src/lib/types/hakemus';
import { SaveRibbon } from '@/src/components/SaveRibbon';

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
    tallennaPaatos,
    isSaving,
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
      tallennaPaatos={tallennaPaatos}
      isSaving={isSaving || false}
      hakemus={hakemus!}
    />
  );
}

const Paatostiedot = ({
  paatos,
  tallennaPaatos,
  isSaving,
  hakemus,
}: {
  paatos: Paatos;
  tallennaPaatos: (paatos: Paatos) => void;
  isSaving: boolean;
  hakemus: Hakemus;
}) => {
  const { t } = useTranslations();
  const theme = useTheme();

  // Use editable state hook for automatic change tracking and save handling
  const paatosState = useEditableState(paatos, tallennaPaatos);

  // Local state for paatosTiedot list (derived from editedData)
  const [currentPaatosTiedot, setCurrentPaatosTiedot] = React.useState<
    PaatosTieto[]
  >([]);

  // Sync paatosTiedot when editedData changes
  useEffect(() => {
    if (paatosState.editedData) {
      setCurrentPaatosTiedot(
        paatosState.editedData.paatosTiedot?.length
          ? paatosState.editedData.paatosTiedot
          : [emptyPaatosTieto(paatosState.editedData.id!)],
      );
    }
  }, [paatosState.editedData]);

  // Update local state only
  const updatePaatosField = (updatedPaatos: Partial<Paatos>) => {
    paatosState.updateLocal(updatedPaatos);
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
    const newPaatosTiedot = currentPaatosTiedot.concat([
      emptyPaatosTieto(paatos.id!),
    ]);
    setCurrentPaatosTiedot(newPaatosTiedot);
    updatePaatosField({ paatosTiedot: newPaatosTiedot });
  };

  const deletePaatosTieto = (id: string | undefined) => {
    const newPaatosTiedot = id
      ? currentPaatosTiedot.filter((paatostieto) => paatostieto.id !== id)
      : currentPaatosTiedot.slice(0, -1);
    setCurrentPaatosTiedot(newPaatosTiedot);
    updatePaatosField({ paatosTiedot: newPaatosTiedot });
  };

  if (!paatosState.editedData) {
    return <FullSpinner />;
  }

  const currentPaatos = paatosState.editedData;

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
        isSaving={isSaving}
        hasChanges={paatosState.hasChanges}
      />
    </Stack>
  );
};
