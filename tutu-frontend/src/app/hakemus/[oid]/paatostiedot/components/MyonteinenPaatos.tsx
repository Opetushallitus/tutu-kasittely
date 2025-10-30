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
  lisavaatimukset: MyonteisenPaatoksenLisavaatimukset;
  updateMyonteinenPaatosAction: (
    myonteinenPaatos: boolean,
    lisavaatimukset: MyonteisenPaatoksenLisavaatimukset,
  ) => void;
}

export const MyonteinenPaatos = ({
  t,
  myonteinenPaatos,
  lisavaatimukset,
  updateMyonteinenPaatosAction,
}: MyonteinenPaatosProps) => {
  const theme = useTheme();
  return (
    <Stack direction="column" gap={theme.spacing(2)}>
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
          updateMyonteinenPaatosAction(
            e.target.value === 'true',
            {} as MyonteisenPaatoksenLisavaatimukset,
          )
        }
      />
      {myonteinenPaatos && (
        <>
          <OphTypography variant="h5" data-testid="imiPyynto-otsikko">
            {t('hakemus.paatos.myonteinenPaatos.otsikko')}
          </OphTypography>
          <OphCheckbox
            label={t('hakemus.paatos.myonteinenPaatos.taydentavatOpinnot')}
            checked={lisavaatimukset.taydentavatOpinnot || false}
            onChange={(e) =>
              updateMyonteinenPaatosAction(true, {
                taydentavatOpinnot: e.target.checked,
              } as MyonteisenPaatoksenLisavaatimukset)
            }
          />
          <OphCheckbox
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
