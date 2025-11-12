'use client';

import { Stack, useTheme } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { CalendarComponent } from '@/src/components/calendar-component';
import * as dateFns from 'date-fns';
import { DATE_TIME_STANDARD_PLACEHOLDER } from '@/src/constants/constants';
import React from 'react';
import { Paatos } from '@/src/lib/types/paatos';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';

interface PaatosHeaderProps {
  paatos: Paatos;
  updatePaatosField: (fieldValue: Partial<Paatos>) => void;
  t: TFunction;
}

export const PaatosHeader = ({
  paatos,
  updatePaatosField,
  t,
}: PaatosHeaderProps) => {
  const theme = useTheme();

  const hyvaksymispaiva = paatos.hyvaksymispaiva
    ? new Date(paatos.hyvaksymispaiva)
    : null;
  const lahetyspaiva = paatos.lahetyspaiva
    ? new Date(paatos.lahetyspaiva)
    : null;
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Stack direction="column" gap={theme.spacing(3)}>
        <OphTypography variant={'h2'}>
          {t('hakemus.paatos.otsikko')}
        </OphTypography>
        <Stack direction="row" gap={theme.spacing(2)}>
          <CalendarComponent
            setDate={(date: Date | null) =>
              updatePaatosField({
                hyvaksymispaiva: date
                  ? dateFns.format(date, DATE_TIME_STANDARD_PLACEHOLDER)
                  : null,
              })
            }
            selectedValue={hyvaksymispaiva}
            maxDate={null}
            //TODO
            label={t('hakemus.paatos.hyvaksymispaiva')}
            dataTestId="paatos-hyvaksymispaiva-calendar"
          />
          <CalendarComponent
            setDate={(date: Date | null) =>
              updatePaatosField({
                lahetyspaiva: date
                  ? dateFns.format(date, DATE_TIME_STANDARD_PLACEHOLDER)
                  : null,
              })
            }
            selectedValue={lahetyspaiva}
            maxDate={null}
            label={t('hakemus.paatos.lahetyspaiva')}
            dataTestId="paatos-lahetyspaiva-calendar"
          />
        </Stack>
      </Stack>
    </Stack>
  );
};
