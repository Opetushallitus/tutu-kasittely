'use client';

import { Divider, Stack, useTheme } from '@mui/material';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import useToaster from '@/src/hooks/useToaster';
import { useHakemus } from '@/src/context/HakemusContext';
import React, { useEffect } from 'react';
import { handleFetchError } from '@/src/lib/utils';
import { FullSpinner } from '@/src/components/FullSpinner';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { Yhteistutkinto } from '@/src/app/hakemus/[oid]/tutkinnot/components/Yhteistutkinto';
import { TutkintoComponent } from '@/src/app/hakemus/[oid]/tutkinnot/components/TutkintoComponent';
import { MuuTutkintoComponent } from '@/src/app/hakemus/[oid]/tutkinnot/components/MuuTutkintoComponent';
import { Tutkinto } from '@/src/lib/types/hakemus';
import { useKoodistoOptions } from '@/src/hooks/useKoodistoOptions';
import { useDebounce } from '@/src/hooks/useDebounce';
import { Add } from '@mui/icons-material';
import { findSisaltoQuestionAndAnswer } from '@/src/lib/hakemuspalveluUtils';
import {
  paatosJaAsiointikieli,
  paatosKieli,
} from '@/src/constants/hakemuspalveluSisalto';

export default function TutkintoPage() {
  const theme = useTheme();
  const { t, getLanguage } = useTranslations();
  const { addToast } = useToaster();
  const { isLoading, hakemus, error, updateHakemus } = useHakemus();
  const { maatJaValtiotOptions, koulutusLuokitusOptions } =
    useKoodistoOptions();
  const [tutkinnot, setTutkinnot] = React.useState<Tutkinto[]>([]);
  const [hakemuksenPaatosKieli, setHakemuksenPaatosKieli] = React.useState<
    string | undefined
  >();

  useEffect(() => {
    if (!hakemus) return;
    setTutkinnot(hakemus.tutkinnot);

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

  const debouncedTutkinnotUpdateAction = useDebounce((next: Tutkinto) => {
    const oldTutkinnot = hakemus!.tutkinnot.filter(
      (tutkinto) => tutkinto.id !== next.id,
    );
    updateHakemus({ tutkinnot: [...oldTutkinnot, next] });
  }, 1000);

  const debouncedTutkinnotDeleteAction = useDebounce(
    (id: string | undefined) => {
      const tutkinnot = hakemus!.tutkinnot.filter(
        (tutkinto) => tutkinto.id !== id,
      );
      updateHakemus({ tutkinnot: tutkinnot });
    },
    0,
  );

  const emptyTutkinto = (hakemusId: string, jarjestys: string) => ({
    id: '',
    hakemusId: hakemusId,
    jarjestys: jarjestys,
    nimi: '',
    oppilaitos: '',
    aloitusVuosi: undefined,
    paattymisVuosi: undefined,
    maakoodi: '',
    muuTutkintoTieto: '',
    todistuksenPaivamaara: '',
  });

  const addTutkinto = () => {
    const jarjestys = tutkinnot.filter(
      (tutkinto) => tutkinto.jarjestys !== 'MUU',
    ).length;

    const hakemusId = tutkinnot[0]!.hakemusId;
    setTutkinnot((tutkinnot) => [
      ...tutkinnot,
      emptyTutkinto(hakemusId, (jarjestys + 1).toString()),
    ]);
  };

  if (error) {
    return null;
  }

  if (isLoading || !hakemus) return <FullSpinner></FullSpinner>;

  const muuTutkinto = tutkinnot.find(
    (tutkinto) => tutkinto.jarjestys === 'MUU',
  );

  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{ flexGrow: 1, marginRight: theme.spacing(3) }}
    >
      <OphTypography variant={'h2'}>
        {t('hakemus.tutkinnot.otsikko')}
      </OphTypography>
      <Yhteistutkinto
        hakemus={hakemus}
        updateHakemus={debouncedTutkinnotUpdateAction}
        t={t}
      />
      {tutkinnot
        .filter((tutkinto) => tutkinto.jarjestys !== 'MUU')
        .map((tutkinto, index) => (
          <TutkintoComponent
            key={index}
            tutkinto={tutkinto}
            maatJaValtiotOptions={maatJaValtiotOptions}
            koulutusLuokitusOptions={koulutusLuokitusOptions}
            updateTutkintoAction={debouncedTutkinnotUpdateAction}
            deleteTutkintoAction={debouncedTutkinnotDeleteAction}
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
      {muuTutkinto && (
        <MuuTutkintoComponent
          tutkinto={muuTutkinto}
          hakemus={hakemus}
          updateTutkintoAction={debouncedTutkinnotUpdateAction}
          t={t}
        />
      )}
    </Stack>
  );
}
