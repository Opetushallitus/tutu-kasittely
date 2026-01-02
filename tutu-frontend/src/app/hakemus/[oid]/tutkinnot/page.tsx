'use client';

import { Add } from '@mui/icons-material';
import { Divider, Stack, useTheme } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import React, { useEffect, useState } from 'react';

import { MuuTutkintoComponent } from '@/src/app/hakemus/[oid]/tutkinnot/components/MuuTutkintoComponent';
import { TutkintoComponent } from '@/src/app/hakemus/[oid]/tutkinnot/components/TutkintoComponent';
import { Yhteistutkinto } from '@/src/app/hakemus/[oid]/tutkinnot/components/Yhteistutkinto';
import { FullSpinner } from '@/src/components/FullSpinner';
import { SaveRibbon } from '@/src/components/SaveRibbon';
import {
  paatosJaAsiointikieli,
  paatosKieli,
} from '@/src/constants/hakemuspalveluSisalto';
import { useHakemus } from '@/src/context/HakemusContext';
import { useKoodistoOptions } from '@/src/hooks/useKoodistoOptions';
import useToaster from '@/src/hooks/useToaster';
import { useTutkinnot } from '@/src/hooks/useTutkinnot';
import { findSisaltoQuestionAndAnswer } from '@/src/lib/hakemuspalveluUtils';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { Tutkinto } from '@/src/lib/types/tutkinto';
import { handleFetchError, updateTutkintoJarjestys } from '@/src/lib/utils';

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
      (tutkinto) => tutkinto.jarjestys !== next.jarjestys,
    );
    tutkintoState.updateLocal([...oldTutkinnot, next]);
  };

  const deleteTutkinto = async (tutkinto: Tutkinto) => {
    if (!tutkinto.id || tutkinto.id?.startsWith('new')) {
      const tutkinnot = editedTutkinnot
        .filter((t) => t.id !== tutkinto.id)
        .map((t) => updateTutkintoJarjestys(t, tutkinto.jarjestys));
      tutkintoState.updateLocal(tutkinnot);
    } else {
      // jos tutkintoa ei ole vielä tallennettu tietokantaan, riittää lokaalin tilan päivitys
      await poistaTutkinto(tutkinto);
    }
  };

  const emptyTutkinto = (hakemusId: string, jarjestys: string) => ({
    id: `new-${Date.now()}`,
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
    !tutkintoState.editedData ||
    isSaving
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
        <OphTypography variant={'h2'} data-testid="tutkinnot-otsikko">
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
          .map((tutkinto) => (
            <TutkintoComponent
              key={tutkinto.id}
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
        lastSaved={hakemusState.editedData.muokattu}
        modifierFirstName={hakemusState.editedData.muokkaajaKutsumanimi}
        modifierLastName={hakemusState.editedData.muokkaajaSukunimi}
      />
    </>
  );
}
