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

export default function TutkintoPage() {
  const theme = useTheme();
  const { t } = useTranslations();
  const { addToast } = useToaster();
  const { isLoading, hakemus, error, updateHakemus } = useHakemus();

  useEffect(() => {
    handleFetchError(addToast, error, 'virhe.hakemuksenLataus', t);
  }, [error, addToast, t]);

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
      <Yhteistutkinto hakemus={hakemus} updateHakemus={updateHakemus} t={t} />
      {}
      <TutkintoComponent
        tutkinto={hakemus.tutkinnot.tutkinto1}
        updateHakemus={updateHakemus}
        otsikko={'hakemus.tutkinnot.tutkinto.tutkinto1'}
        t={t}
      />
      {hakemus.tutkinnot.tutkinto2 && (
        <TutkintoComponent
          tutkinto={hakemus.tutkinnot.tutkinto2}
          updateHakemus={updateHakemus}
          otsikko={'hakemus.tutkinnot.tutkinto.tutkinto2'}
          t={t}
        />
      )}
      {hakemus.tutkinnot.tutkinto3 && (
        <TutkintoComponent
          tutkinto={hakemus.tutkinnot.tutkinto3}
          updateHakemus={updateHakemus}
          otsikko={'hakemus.tutkinnot.tutkinto.tutkinto3'}
          t={t}
        />
      )}
      {hakemus.tutkinnot.muuTutkinto && (
        <TutkintoComponent
          tutkinto={hakemus.tutkinnot.muuTutkinto}
          updateHakemus={updateHakemus}
          otsikko={'hakemus.tutkinnot.tutkinto.muuTutkinto'}
          t={t}
        />
      )}
    </Stack>
  );
}
