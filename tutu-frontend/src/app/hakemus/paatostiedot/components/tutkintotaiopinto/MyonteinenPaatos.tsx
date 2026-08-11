import { Stack } from '@mui/material';
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

export interface MyonteinenPaatosProps {
  t: TFunction;
  tutkintoTaiOpinto?: string;
  updateLisavaatimukset: MyonteisenPaatoksenLisavaatimusUpdateCallback;
  lisavaatimukset?: MyonteisenPaatoksenLisavaatimukset;
}

export const MyonteinenPaatos: React.FC<MyonteinenPaatosProps> = ({
  t,
  updateLisavaatimukset,
  lisavaatimukset,
}: MyonteinenPaatosProps) => {
  return (
    <OphFormFieldWrapper
      label={t('hakemus.paatos.myonteinenPaatos.otsikko')}
      sx={{ gap: 2 }}
      renderInput={() => (
        <Stack direction="column" gap={2}>
          <OphCheckbox
            data-testid="myonteinenPaatos-taydentavatOpinnot"
            label={t('hakemus.paatos.myonteinenPaatos.taydentavatOpinnot')}
            checked={lisavaatimukset?.taydentavatOpinnot || false}
            onChange={(e) =>
              updateLisavaatimukset({
                ...lisavaatimukset,
                taydentavatOpinnot: e.target.checked,
              })
            }
          />
          <OphCheckbox
            data-testid="myonteinenPaatos-kelpoisuuskoe"
            label={t('hakemus.paatos.myonteinenPaatos.kelpoisuuskoe')}
            checked={lisavaatimukset?.kelpoisuuskoe || false}
            onChange={(e) =>
              updateLisavaatimukset({
                ...lisavaatimukset,
                kelpoisuuskoe: e.target.checked,
              })
            }
          />
          <OphCheckbox
            data-testid="myonteinenPaatos-sopeutumisaika"
            label={t('hakemus.paatos.myonteinenPaatos.sopeutumisaika')}
            checked={lisavaatimukset?.sopeutumisaika || false}
            onChange={(e) =>
              updateLisavaatimukset({
                ...lisavaatimukset,
                sopeutumisaika: e.target.checked,
              })
            }
          />
        </Stack>
      )}
    />
  );
};
