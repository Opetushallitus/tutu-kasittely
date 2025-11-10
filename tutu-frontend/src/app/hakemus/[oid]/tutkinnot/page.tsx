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
  const { isLoading, hakemusState, error, isSaving } = useHakemus();
  const { maatJaValtiotOptions, koulutusLuokitusOptions } =
    useKoodistoOptions();
  const editedTutkinnot = hakemusState.editedData?.tutkinnot ?? [];
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
    handleFetchError(addToast, error, 'virhe.hakemuksenLataus', t);
  }, [error, addToast, t]);

  const updateTutkintoLocal = (next: Tutkinto) => {
    const oldTutkinnot = editedTutkinnot.filter(
      (tutkinto) => tutkinto.id !== next.id,
    );
    hakemusState.updateLocal({ tutkinnot: [...oldTutkinnot, next] });
  };

  const deleteTutkintoLocal = (id: string | undefined) => {
    const tutkinnot = editedTutkinnot.filter((tutkinto) => tutkinto.id !== id);
    hakemusState.updateLocal({ tutkinnot });
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
    hakemusState.updateLocal({
      tutkinnot: [
        ...editedTutkinnot,
        emptyTutkinto(hakemusId, (jarjestys + 1).toString()),
      ],
    });
  };

  if (error) {
    return null;
  }

  if (isLoading || !hakemusState.editedData) return <FullSpinner></FullSpinner>;

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
          hakemus={hakemusState.editedData}
          updateTutkintoAction={updateTutkintoLocal}
          t={t}
        />
      </Stack>
      <SaveRibbon
        onSave={hakemusState.save}
        isSaving={isSaving || false}
        hasChanges={hakemusState.hasChanges}
      />
    </>
  );
}
