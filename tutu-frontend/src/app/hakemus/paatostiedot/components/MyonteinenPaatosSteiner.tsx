'use client';
import { Theme } from '@mui/material/styles';
import {
  OphCheckbox,
  OphFormFieldWrapper,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  MyonteisenPaatoksenLisavaatimukset,
  MyonteisenPaatoksenLisavaatimusUpdateCallback,
} from '@/src/lib/types/paatos';

interface MyonteinenPaatosProps {
  t: TFunction;
  theme: Theme;
  updateLisavaatimukset: MyonteisenPaatoksenLisavaatimusUpdateCallback;
  lisavaatimukset?: MyonteisenPaatoksenLisavaatimukset;
}

export const MyonteinenPaatosSteiner: React.FC<MyonteinenPaatosProps> = ({
  t,
  theme,
  updateLisavaatimukset,
  lisavaatimukset,
}: MyonteinenPaatosProps) => {
  return (
    <OphFormFieldWrapper
      label={t('hakemus.paatos.myonteinenPaatos.otsikko')}
      sx={{ gap: theme.spacing(2) }}
      renderInput={() => (
        <OphCheckbox
          data-testid="myonteinenPaatos-taydentavat-opinnot"
          label={t('hakemus.paatos.myonteinenPaatos.taydentavatOpinnot')}
          checked={lisavaatimukset?.taydentavatOpinnot || false}
          onChange={(e) =>
            updateLisavaatimukset({
              ...lisavaatimukset,
              taydentavatOpinnot: e.target.checked,
            })
          }
        />
      )}
    />
  );
};
