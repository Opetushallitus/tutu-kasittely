'use client';

import { Divider, Stack, useTheme } from '@mui/material';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import useToaster from '@/src/hooks/useToaster';
import { useHakemus } from '@/src/context/HakemusContext';
import React, { useEffect, useMemo, useState } from 'react';
import { handleFetchError } from '@/src/lib/utils';
import { FullSpinner } from '@/src/components/FullSpinner';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { Yhteistutkinto } from '@/src/app/hakemus/[oid]/tutkinnot/components/Yhteistutkinto';
import { TutkintoComponent } from '@/src/app/hakemus/[oid]/tutkinnot/components/TutkintoComponent';
import { MuuTutkintoComponent } from '@/src/app/hakemus/[oid]/tutkinnot/components/MuuTutkintoComponent';
import { HakemusUpdateRequest, Tutkinto } from '@/src/lib/types/hakemus';
import { useKoodistoOptions } from '@/src/hooks/useKoodistoOptions';
import { Add } from '@mui/icons-material';
import { findSisaltoQuestionAndAnswer } from '@/src/lib/hakemuspalveluUtils';
import {
  paatosJaAsiointikieli,
  paatosKieli,
} from '@/src/constants/hakemuspalveluSisalto';
import { SaveRibbon } from '@/src/components/SaveRibbon';

export default function TutkintoPage() {
  const theme = useTheme();
  const { t, getLanguage } = useTranslations();
  const { addToast } = useToaster();
  const { isLoading, hakemus, error, tallennaHakemus, isSaving } = useHakemus();
  const { maatJaValtiotOptions, koulutusLuokitusOptions } =
    useKoodistoOptions();

  // Local editable state
  const [editedTutkinnot, setEditedTutkinnot] = useState<Tutkinto[]>([]);
  const [editedYhteistutkinto, setEditedYhteistutkinto] =
    useState<boolean>(false);
  const [hakemuksenPaatosKieli, setHakemuksenPaatosKieli] = useState<
    string | undefined
  >();

  // Sync server data to local state when loaded
  useEffect(() => {
    if (!hakemus) return;
    setEditedTutkinnot(hakemus.tutkinnot);
    setEditedYhteistutkinto(hakemus.yhteistutkinto);

    const [, paatosKieliVal] = findSisaltoQuestionAndAnswer(
      hakemus.sisalto,
      [paatosJaAsiointikieli, paatosKieli],
      getLanguage(),
    );
    setHakemuksenPaatosKieli(paatosKieliVal === 'suomeksi' ? 'fi' : 'sv');
  }, [hakemus, getLanguage]);

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuksenLataus', t);
  }, [error, addToast, t]);

  // Track if there are unsaved changes
  const hasChanges = useMemo(() => {
    if (!hakemus) return false;
    return (
      JSON.stringify(hakemus.tutkinnot) !== JSON.stringify(editedTutkinnot) ||
      hakemus.yhteistutkinto !== editedYhteistutkinto
    );
  }, [hakemus, editedTutkinnot, editedYhteistutkinto]);

  // Save handler
  const handleSave = () => {
    if (!hakemus || !hasChanges) return;

    const updateRequest: HakemusUpdateRequest = {
      hakemusKoskee: hakemus.hakemusKoskee,
      asiatunnus: hakemus.asiatunnus || null,
      kirjausPvm: hakemus.kirjausPvm || null,
      esittelyPvm: hakemus.esittelyPvm || null,
      paatosPvm: hakemus.paatosPvm || null,
      esittelijaOid: hakemus.esittelijaOid || null,
      kasittelyVaihe: hakemus.kasittelyVaihe,
      yhteistutkinto: editedYhteistutkinto,
      tutkinnot: editedTutkinnot,
      asiakirja: hakemus.asiakirja,
    };

    tallennaHakemus(updateRequest);
  };

  // Update handlers for local state only
  const updateTutkintoLocal = (next: Tutkinto) => {
    const oldTutkinnot = editedTutkinnot.filter(
      (tutkinto) => tutkinto.id !== next.id,
    );
    setEditedTutkinnot([...oldTutkinnot, next]);
  };

  const deleteTutkintoLocal = (id: string | undefined) => {
    const tutkinnot = editedTutkinnot.filter((tutkinto) => tutkinto.id !== id);
    setEditedTutkinnot(tutkinnot);
  };

  const emptyTutkinto = (hakemusId: string, jarjestys: string) => ({
    id: '',
    hakemusId: hakemusId,
    jarjestys: jarjestys,
    nimi: '',
    oppilaitos: '',
    aloitusVuosi: undefined,
    paattymisVuosi: undefined,
    maakoodiUri: '',
    muuTutkintoTieto: '',
    todistuksenPaivamaara: '',
  });

  const addTutkinto = () => {
    const jarjestys = editedTutkinnot.filter(
      (tutkinto) => tutkinto.jarjestys !== 'MUU',
    ).length;

    const hakemusId = editedTutkinnot[0]!.hakemusId;
    setEditedTutkinnot((tutkinnot) => [
      ...tutkinnot,
      emptyTutkinto(hakemusId, (jarjestys + 1).toString()),
    ]);
  };

  if (error) {
    return null;
  }

  if (isLoading || !hakemus) return <FullSpinner></FullSpinner>;

  const muuTutkinto = editedTutkinnot.find(
    (tutkinto) => tutkinto.jarjestys === 'MUU',
  );

  return (
    <>
      <Stack
        gap={theme.spacing(3)}
        sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}
      >
        <OphTypography variant={'h2'}>
          {t('hakemus.tutkinnot.otsikko')}
        </OphTypography>
        <Yhteistutkinto
          hakemus={{ ...hakemus, yhteistutkinto: editedYhteistutkinto }}
          updateHakemus={(patch) => {
            if (patch.yhteistutkinto !== undefined) {
              setEditedYhteistutkinto(patch.yhteistutkinto);
            }
          }}
          t={t}
        />
        {editedTutkinnot
          .filter((tutkinto) => tutkinto.jarjestys !== 'MUU')
          .map((tutkinto, index) => (
            <TutkintoComponent
              key={index}
              tutkinto={tutkinto}
              maatJaValtiotOptions={maatJaValtiotOptions}
              koulutusLuokitusOptions={koulutusLuokitusOptions}
              updateTutkintoAction={updateTutkintoLocal}
              deleteTutkintoAction={deleteTutkintoLocal}
              paatosKieli={hakemuksenPaatosKieli as string}
              t={t}
            />
          ))}
        <OphButton
          sx={{
            alignSelf: 'flex-start',
          }}
          data-testid={`lisaa-tutkinto-button`}
          variant="outlined"
          startIcon={<Add />}
          onClick={addTutkinto}
        >
          {t('hakemus.tutkinnot.lisaaTutkinto')}
        </OphButton>
        <Divider orientation={'horizontal'} />
        <MuuTutkintoComponent
          tutkinto={muuTutkinto}
          hakemus={hakemus}
          updateTutkintoAction={updateTutkintoLocal}
          t={t}
        />
      </Stack>
      <SaveRibbon
        onSave={handleSave}
        isSaving={isSaving || false}
        hasChanges={hasChanges}
      />
    </>
  );
}
