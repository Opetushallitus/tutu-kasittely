import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { PaatosTaydennyspyyntoStack } from '@/src/app/hakemus/[oid]/components/sidebar/PaatosTaydennyspyyntoStack';
import { useTheme } from '@mui/material';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { DATE_PLACEHOLDER } from '@/src/constants/constants';

export const Taydennyspyynto = () => {
  const theme = useTheme();
  const { t } = useTranslations();

  return (
    <PaatosTaydennyspyyntoStack direction="column" gap={theme.spacing(2)}>
      <OphTypography variant={'h4'}>
        {t('hakemus.sivupalkki.taydennysPyynto.otsikko')}
      </OphTypography>
      <OphCheckbox
        sx={{
          '& svg': { marginTop: '1px' },
        }}
        label={t('hakemus.sivupalkki.taydennysPyynto.lahetetty')}
      />
      <OphInputFormField
        label={t('hakemus.sivupalkki.taydennysPyynto.maaraaika')}
        placeholder={DATE_PLACEHOLDER}
      ></OphInputFormField>
    </PaatosTaydennyspyyntoStack>
  );
};
