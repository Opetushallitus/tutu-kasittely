'use client';

import { Divider, Stack, useTheme } from '@mui/material';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import useToaster from '@/src/hooks/useToaster';
import { useHakemus } from '@/src/context/HakemusContext';
import React, { useEffect, useState } from 'react';
import { handleFetchError } from '@/src/lib/utils';
import { FullSpinner } from '@/src/components/FullSpinner';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { Yhteistutkinto } from '@/src/app/hakemus/[oid]/tutkinnot/components/Yhteistutkinto';
import { TutkintoComponent } from '@/src/app/hakemus/[oid]/tutkinnot/components/TutkintoComponent';
import { MuuTutkintoComponent } from '@/src/app/hakemus/[oid]/tutkinnot/components/MuuTutkintoComponent';
import { Tutkinto } from '@/src/lib/types/tutkinto';
import { useKoodistoOptions } from '@/src/hooks/useKoodistoOptions';
import { Add } from '@mui/icons-material';
import { findSisaltoQuestionAndAnswer } from '@/src/lib/hakemuspalveluUtils';
import {
  paatosJaAsiointikieli,
  paatosKieli,
} from '@/src/constants/hakemuspalveluSisalto';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import { useTutkinnot } from '@/src/hooks/useTutkinnot';

export default function TutkintoPage() {
  const theme = useTheme();
  const { t, getLanguage } = useTranslations();
  const { addToast } = useToaster();
  const {
    isLoading: isHakemusLoading,
    hakemusState,
    error: hakemusError,
    isSaving: isHakemusSaving,
  } = useHakemus();
  const { isLoading, isSaving, error, tutkintoState, poistaTutkinto } =
    useTutkinnot(hakemusState.editedData?.hakemusOid);
  const { maatJaValtiotOptions, koulutusLuokitusOptions } =
    useKoodistoOptions();
  const editedTutkinnot = tutkintoState.editedData ?? [];
  const [hakemuksenPaatosKieli, setHakemuksenPaatosKieli] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (!hakemusState.editedData) return;
    const [, paatosKieliVal] = findSisaltoQuestionAndAnswer(
      hakemusState.editedData.sisalto,
      [paatosJaAsiointikieli, paatosKieli],
      getLanguage(),
    );
    setHakemuksenPaatosKieli(paatosKieliVal === 'suomeksi' ? 'fi' : 'sv');
  }, [hakemusState.editedData, getLanguage]);

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
    handleFetchError(addToast, error, 'virhe.tutkintojenLataus', t);
  }, [error, hakemusError, addToast, t]);

  const updateTutkintoLocal = (next: Tutkinto) => {
    const oldTutkinnot = editedTutkinnot.filter(
      (tutkinto) => tutkinto.id !== next.id,
    );
    tutkintoState.updateLocal([...oldTutkinnot, next]);
  };

  const deleteTutkinto = async (tutkinto: Tutkinto) => {
    if (!tutkinto.id) {
      // jos tutkinnolla ei ole id:tä sitä ei ole vielä tallennettu tietokantaan ja riittää lokaalin tilan päivitys
      const tutkinnot = editedTutkinnot.filter(
        (t) => t.jarjestys !== tutkinto.jarjestys,
      );
      tutkintoState.updateLocal(tutkinnot);
    } else {
      await poistaTutkinto(tutkinto);
    }
  };

  const emptyTutkinto = (hakemusId: string, jarjestys: string) => ({
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
    tutkintoState.updateLocal([
      ...editedTutkinnot,
      emptyTutkinto(hakemusId, (jarjestys + 1).toString()),
    ]);
  };

  if (error) {
    return null;
  }

  if (
    isHakemusLoading ||
    !hakemusState.editedData ||
    isLoading ||
    !tutkintoState.editedData
  )
    return <FullSpinner></FullSpinner>;

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
          hakemus={hakemusState.editedData}
          updateHakemus={(patch) => {
            if (patch.yhteistutkinto !== undefined) {
              hakemusState.updateLocal({
                yhteistutkinto: patch.yhteistutkinto,
              });
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
              deleteTutkintoAction={deleteTutkinto}
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
          hakemus={hakemusState.editedData}
          updateTutkintoAction={updateTutkintoLocal}
          t={t}
        />
      </Stack>
      <SaveRibbon
        onSave={() => {
          hakemusState.save();
          tutkintoState.save();
        }}
        isSaving={isHakemusSaving || isSaving}
        hasChanges={hakemusState.hasChanges || tutkintoState.hasChanges}
      />
    </>
  );
}
