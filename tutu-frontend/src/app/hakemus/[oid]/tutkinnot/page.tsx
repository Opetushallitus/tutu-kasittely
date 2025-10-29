'use client';

import { Divider, Stack, useTheme } from '@mui/material';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import useToaster from '@/src/hooks/useToaster';
import { useHakemus } from '@/src/context/HakemusContext';
import React, { useEffect, useState } from 'react';
import { handleFetchError, buildHakemusUpdateRequest } from '@/src/lib/utils';
import { useEditableState } from '@/src/hooks/useEditableState';
import { FullSpinner } from '@/src/components/FullSpinner';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { Yhteistutkinto } from '@/src/app/hakemus/[oid]/tutkinnot/components/Yhteistutkinto';
import { TutkintoComponent } from '@/src/app/hakemus/[oid]/tutkinnot/components/TutkintoComponent';
import { MuuTutkintoComponent } from '@/src/app/hakemus/[oid]/tutkinnot/components/MuuTutkintoComponent';
import { Tutkinto } from '@/src/lib/types/hakemus';
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

  // Extract fields to avoid referencing hakemus object in memo
  const tutkinnot = hakemus?.tutkinnot;
  const yhteistutkinto = hakemus?.yhteistutkinto;

  // Memoize the server data object to prevent unnecessary resets
  const serverData = React.useMemo(
    () =>
      tutkinnot !== undefined && yhteistutkinto !== undefined
        ? { tutkinnot, yhteistutkinto }
        : undefined,
    [tutkinnot, yhteistutkinto],
  );

  // Use editableState hook for tutkinnot and yhteistutkinto
  const {
    editedData: editedData,
    hasChanges,
    updateLocal,
    save,
  } = useEditableState(serverData, (data) => {
    tallennaHakemus(
      buildHakemusUpdateRequest(hakemus!, {
        tutkinnot: data.tutkinnot,
        yhteistutkinto: data.yhteistutkinto,
      }),
    );
  });

  const editedTutkinnot = editedData?.tutkinnot ?? [];
  const editedYhteistutkinto = editedData?.yhteistutkinto ?? false;

  // UI-specific state for paatos kieli (derived from sisalto)
  const [hakemuksenPaatosKieli, setHakemuksenPaatosKieli] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (!hakemus) return;
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

  // Update handlers for local state only
  const updateTutkintoLocal = (next: Tutkinto) => {
    const oldTutkinnot = editedTutkinnot.filter(
      (tutkinto) => tutkinto.id !== next.id,
    );
    updateLocal({ tutkinnot: [...oldTutkinnot, next] });
  };

  const deleteTutkintoLocal = (id: string | undefined) => {
    const tutkinnot = editedTutkinnot.filter((tutkinto) => tutkinto.id !== id);
    updateLocal({ tutkinnot });
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
    updateLocal({
      tutkinnot: [
        ...editedTutkinnot,
        emptyTutkinto(hakemusId, (jarjestys + 1).toString()),
      ],
    });
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
              updateLocal({ yhteistutkinto: patch.yhteistutkinto });
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
        onSave={save}
        isSaving={isSaving || false}
        hasChanges={hasChanges}
      />
    </>
  );
}
