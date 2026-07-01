'use client';
import { Stack } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { OphCheckbox, OphTypography } from '@opetushallitus/oph-design-system';
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

export const MyonteinenPaatos: React.FC<MyonteinenPaatosProps> = ({
  t,
  theme,
  updateLisavaatimukset,
  lisavaatimukset,
}: MyonteinenPaatosProps) => {
  return (
    <Stack direction="column" gap={theme.spacing(2)}>
      <OphTypography variant="h5">
        {t('hakemus.paatos.myonteinenPaatos.otsikko')}
      </OphTypography>
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
  );
};
