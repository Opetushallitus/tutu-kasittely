'use client';

import { Stack, useTheme } from '@mui/material';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import useToaster from '@/src/hooks/useToaster';
import { useHakemus } from '@/src/context/HakemusContext';
import React, { useEffect } from 'react';
import { handleFetchError } from '@/src/lib/utils';
import { FullSpinner } from '@/src/components/FullSpinner';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { Yhteistutkinto } from '@/src/app/hakemus/[oid]/tutkinnot/components/Yhteistutkinto';
import { TutkintoComponent } from '@/src/app/(root)/hakemus/[oid]/tutkinnot/components/TutkintoComponent';
import { Tutkinto } from '@/src/lib/types/hakemus';
import { useKoodistoOptions } from '@/src/hooks/useKoodistoOptions';
import { useDebounce } from '@/src/hooks/useDebounce';

export default function TutkintoPage() {
  const theme = useTheme();
  const { t } = useTranslations();
  const { addToast } = useToaster();
  const { isLoading, hakemus, error, updateHakemus } = useHakemus();
  const { maatJaValtiotOptions, koulutusLuokitusOptions } =
    useKoodistoOptions();

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuksenLataus', t);
  }, [error, addToast, t]);

  const debouncedTutkinnotUpdateAction = useDebounce((next: Tutkinto) => {
    updateHakemus({ tutkinnot: [...hakemus!.tutkinnot, next] });
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

  if (error) {
    return null;
  }

  if (isLoading || !hakemus) return <FullSpinner></FullSpinner>;
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
      {hakemus.tutkinnot.map((tutkinto, index) => (
        <TutkintoComponent
          key={index}
          tutkinto={tutkinto}
          maatJaValtiotOptions={maatJaValtiotOptions}
          koulutusLuokitusOptions={koulutusLuokitusOptions}
          updateTutkinto={debouncedTutkinnotUpdateAction}
          deleteTutkinto={debouncedTutkinnotDeleteAction}
          t={t}
        />
      ))}
    </Stack>
  );
}
