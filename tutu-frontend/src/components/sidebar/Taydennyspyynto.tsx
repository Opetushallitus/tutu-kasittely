import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export const Taydennyspyynto = () => {
  const { t } = useTranslations();

  return (
    <>
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
        placeholder={t('yleiset.paivamaaraFormaatti')}
      ></OphInputFormField>
    </>
  );
};
