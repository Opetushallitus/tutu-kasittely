import { Stack } from '@mui/material';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ValitusOPH } from '@/src/lib/types/valitustiedot';

export const ValitusOPHComponent = ({
  valitusOPH,
  updateValitusOPH,
}: {
  valitusOPH?: ValitusOPH;
  updateValitusOPH: (valitustiedot: Partial<ValitusOPH>) => void;
}) => {
  const { t } = useTranslations();

  return (
    <Stack gap={2}>
      <OphTypography variant={'h3'}>
        {t('hakemus.valitustiedot.valitusoph.otsikko')}
      </OphTypography>
      <Stack gap={1}>
        <OphCheckbox
          label={t('hakemus.valitustiedot.valitusoph.maksu')}
          checked={valitusOPH?.maksu ?? false}
          onChange={() => {
            updateValitusOPH({ maksu: !valitusOPH?.maksu });
          }}
        />
        <OphCheckbox
          label={t('hakemus.valitustiedot.valitusoph.asiavirhe')}
          checked={valitusOPH?.asiavirhe ?? false}
          onChange={() => {
            updateValitusOPH({ asiavirhe: !valitusOPH?.asiavirhe });
          }}
        />
        <OphCheckbox
          label={t('hakemus.valitustiedot.valitusoph.kirjoitusvirhe')}
          checked={valitusOPH?.kirjoitusvirhe ?? false}
          onChange={() => {
            updateValitusOPH({ kirjoitusvirhe: !valitusOPH?.kirjoitusvirhe });
          }}
        />
        <OphCheckbox
          label={t('hakemus.valitustiedot.valitusoph.muu')}
          checked={valitusOPH?.muu ?? false}
          onChange={() => {
            updateValitusOPH({ muu: !valitusOPH?.muu });
          }}
        />
      </Stack>
      {(valitusOPH?.maksu ||
        valitusOPH?.asiavirhe ||
        valitusOPH?.kirjoitusvirhe ||
        valitusOPH?.muu) && (
        <OphInputFormField
          label={t('hakemus.valitustiedot.valitusoph.tasmennys')}
          multiline
          value={valitusOPH?.tasmennys ?? ''}
          onChange={(e) => {
            updateValitusOPH({ tasmennys: e.target.value });
          }}
          rows={5}
        />
      )}
    </Stack>
  );
};
