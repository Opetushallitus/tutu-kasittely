'use client';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import {
  OphCheckbox,
  OphRadioGroup,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { myonteinenPaatosOptions } from '@/src/app/hakemus/[oid]/paatostiedot/constants';
import React from 'react';
import { Stack, useTheme } from '@mui/material';
import { MyonteisenPaatoksenLisavaatimukset } from '@/src/lib/types/paatos';

interface MyonteinenPaatosProps {
  t: TFunction;
  myonteinenPaatos?: boolean;
  updateMyonteinenPaatosAction: (
    myonteinenPaatos: boolean,
    lisavaatimukset?: MyonteisenPaatoksenLisavaatimukset,
  ) => void;
  lisavaatimukset?: MyonteisenPaatoksenLisavaatimukset;
}

export const MyonteinenPaatos = ({
  t,
  myonteinenPaatos,
  updateMyonteinenPaatosAction,
  lisavaatimukset,
}: MyonteinenPaatosProps) => {
  const theme = useTheme();
  return (
    <Stack direction="column" gap={theme.spacing(2)}>
      <OphTypography variant="h4">
        {t('hakemus.paatos.tutkinto.myonteinenPaatos')}
      </OphTypography>
      <OphRadioGroup
        labelId="myonteinenPaatos-radio-group-label"
        data-testid="myonteinenPaatos-radio-group"
        sx={{ width: '100%' }}
        options={myonteinenPaatosOptions(t)}
        row
        value={myonteinenPaatos?.toString() || null}
        onChange={(e) =>
          updateMyonteinenPaatosAction(e.target.value === 'true')
        }
      />
      {myonteinenPaatos && lisavaatimukset && (
        <>
          <OphTypography variant="h5">
            {t('hakemus.paatos.myonteinenPaatos.otsikko')}
          </OphTypography>
          <OphCheckbox
            data-testid="myonteinenPaatos-taydentavatOpinnot"
            label={t('hakemus.paatos.myonteinenPaatos.taydentavatOpinnot')}
            checked={lisavaatimukset.taydentavatOpinnot || false}
            onChange={(e) =>
              updateMyonteinenPaatosAction(true, {
                ...lisavaatimukset,
                taydentavatOpinnot: e.target.checked,
              } as MyonteisenPaatoksenLisavaatimukset)
            }
          />
          <OphCheckbox
            data-testid="myonteinenPaatos-kelpoisuuskoe"
            label={t('hakemus.paatos.myonteinenPaatos.kelpoisuuskoe')}
            checked={lisavaatimukset.kelpoisuuskoe || false}
            onChange={(e) =>
              updateMyonteinenPaatosAction(true, {
                ...lisavaatimukset,
                kelpoisuuskoe: e.target.checked,
              } as MyonteisenPaatoksenLisavaatimukset)
            }
          />
          <OphCheckbox
            data-testid="myonteinenPaatos-sopeutumisaika"
            label={t('hakemus.paatos.myonteinenPaatos.sopeutumisaika')}
            checked={lisavaatimukset.sopeutumisaika || false}
            onChange={(e) =>
              updateMyonteinenPaatosAction(true, {
                ...lisavaatimukset,
                sopeutumisaika: e.target.checked,
              } as MyonteisenPaatoksenLisavaatimukset)
            }
          />
        </>
      )}
    </Stack>
  );
};
