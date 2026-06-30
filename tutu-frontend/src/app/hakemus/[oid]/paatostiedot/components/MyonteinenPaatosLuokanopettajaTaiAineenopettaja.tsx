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

export const MyonteinenPaatosLuokanopettajaTaiAineenopettaja: React.FC<
  MyonteinenPaatosProps
> = ({
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
      {lisavaatimukset?.kelpoisuuskoe && (
        <Stack
          direction="column"
          gap={theme.spacing(2)}
          sx={{ marginLeft: theme.spacing(4) }}
        >
          <OphCheckbox
            data-testid="myonteinenPaatos-opettajuutta-tutkimassa"
            label={t('hakemus.paatos.myonteinenPaatos.opettajuuttaTutkimassa')}
            checked={lisavaatimukset?.opettajuuttaTutkimassa || false}
            onChange={(e) =>
              updateLisavaatimukset({
                ...lisavaatimukset,
                opettajuuttaTutkimassa: e.target.checked,
              })
            }
          />
          <OphCheckbox
            data-testid="myonteinenPaatos-suomalainen-koulu"
            label={t('hakemus.paatos.myonteinenPaatos.suomalainenKoulu')}
            checked={lisavaatimukset?.suomalainenKoulu || false}
            onChange={(e) =>
              updateLisavaatimukset({
                ...lisavaatimukset,
                suomalainenKoulu: e.target.checked,
              })
            }
          />
          <OphCheckbox
            data-testid="myonteinenPaatos-opetusnayte"
            label={t('hakemus.paatos.myonteinenPaatos.opetusnayte')}
            checked={lisavaatimukset?.opetusNayte || false}
            onChange={(e) =>
              updateLisavaatimukset({
                ...lisavaatimukset,
                opetusNayte: e.target.checked,
              })
            }
          />
        </Stack>
      )}
    </Stack>
  );
};
