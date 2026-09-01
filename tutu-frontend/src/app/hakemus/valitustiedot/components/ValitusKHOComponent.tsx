import { Stack } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import React from 'react';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export const ValitusKHOComponent = () => {
  const { t } = useTranslations();

  return (
    <Stack gap={2}>
      <OphTypography variant={'h3'}>
        {t('hakemus.valitustiedot.valituskho.otsikko')}
      </OphTypography>
    </Stack>
  );
};
