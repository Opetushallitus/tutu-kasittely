'use client';

import { Preview } from '@mui/icons-material';
import { Stack, useTheme } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import * as dateFns from 'date-fns';
import React from 'react';

import { CalendarComponent } from '@/src/components/calendar-component';
import { DATE_TIME_STANDARD_PLACEHOLDER } from '@/src/constants/constants';
import { useShowPreview } from '@/src/context/ShowPreviewContext';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Paatos } from '@/src/lib/types/paatos';

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
  const { showPaatosTekstiPreview, setShowPaatosTekstiPreview } =
    useShowPreview();

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
            minDate={null}
            maxDate={lahetyspaiva}
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
            disabled={!hyvaksymispaiva}
            selectedValue={lahetyspaiva}
            minDate={hyvaksymispaiva}
            maxDate={null}
            label={t('hakemus.paatos.lahetyspaiva')}
            dataTestId="paatos-lahetyspaiva-calendar"
          />
        </Stack>
      </Stack>
      {!showPaatosTekstiPreview && (
        <OphButton
          sx={{
            alignSelf: 'flex-start',
          }}
          data-testid={`paatos-avaa-esikatselu-button`}
          variant="text"
          startIcon={<Preview />}
          onClick={() => setShowPaatosTekstiPreview(true)}
        >
          {t('hakemus.paatos.esikatselu')}
        </OphButton>
      )}
    </Stack>
  );
};
