'use client';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  OphRadioGroup,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { myonteinenPaatosOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import React from 'react';

interface MyonteinenPaatosProps {
  t: TFunction;
  myonteinenPaatos?: boolean;
  updateMyonteinenPaatosAction: (myonteinenPaatos: boolean) => void;
}

export const MyonteinenPaatos = ({
  t,
  myonteinenPaatos,
  updateMyonteinenPaatosAction,
}: MyonteinenPaatosProps) => {
  return (
    <>
      <OphTypography variant="h4">
        {t('hakemus.paatos.tutkinto.myonteinenPaatos')}
      </OphTypography>
      <OphRadioGroup
        labelId="myonteinenPaatos-radio-group-label"
        data-testid="paatos-myonteinenPaatos-radio-group"
        sx={{ width: '100%' }}
        options={myonteinenPaatosOptions(t)}
        row
        value={myonteinenPaatos?.toString() || null}
        onChange={(e) =>
          updateMyonteinenPaatosAction(e.target.value === 'true')
        }
      />
    </>
  );
};
