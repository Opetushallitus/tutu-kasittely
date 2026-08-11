import { useTheme } from '@mui/material';
import {
  OphCheckbox,
  OphFormFieldWrapper,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { MyonteinenPaatosProps } from '@/src/app/hakemus/paatostiedot/components/tutkintotaiopinto/MyonteinenPaatos';

export const MyonteinenPaatosSteiner: React.FC<MyonteinenPaatosProps> = ({
  t,
  updateLisavaatimukset,
  lisavaatimukset,
}: MyonteinenPaatosProps) => {
  const theme = useTheme();
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
