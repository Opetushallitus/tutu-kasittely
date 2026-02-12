'use client';

import { useTheme } from '@mui/material';
import { Stack } from '@mui/system';
import { OphTypography } from '@opetushallitus/oph-design-system';
import React, { useEffect } from 'react';

import { KieliSelect } from '@/src/app/hakemus/[oid]/editori/viesti/components/KieliSelect';
import { FullSpinner } from '@/src/components/FullSpinner';
import { useHakemus } from '@/src/context/HakemusContext';
import useToaster from '@/src/hooks/useToaster';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { handleFetchError } from '@/src/lib/utils';

export default function ViestiPage() {
  const { t } = useTranslations();
  const theme = useTheme();

  const {
    isLoading: isHakemusLoading,
    hakemusState,
    error: hakemusError,
  } = useHakemus();

  const { addToast } = useToaster();

  useEffect(() => {
    handleFetchError(addToast, hakemusError, 'virhe.hakemuksenLataus', t);
  }, [hakemusError, addToast, t]);

  if (hakemusError) {
    return null;
  }

  if (isHakemusLoading) {
    return <FullSpinner></FullSpinner>;
  }

  return (
    <Stack
      gap={theme.spacing(3)}
      sx={{
        flexGrow: 1,
        marginRight: theme.spacing(3),
      }}
    >
      <OphTypography variant={'h2'}>
        {t('hakemus.viesti.otsikko')}
      </OphTypography>
      <KieliSelect
        hakemuksenKieli={hakemusState.editedData?.lomakkeenKieli || 'fi'}
        t={t}
        theme={theme}
      />
    </Stack>
  );
}
