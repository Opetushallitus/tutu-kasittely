import { Stack, useTheme } from '@mui/material';
import { OphCheckbox, OphTypography } from '@opetushallitus/oph-design-system';
import React from 'react';

import { CalendarComponent } from '@/src/components/calendar-component';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ValitusKHO } from '@/src/lib/types/valitustiedot';

export const ValitusKHOComponent = ({
  valitusKHO,
  updateValitusKHO,
}: {
  valitusKHO?: ValitusKHO;
  updateValitusKHO: (valitustiedot: Partial<ValitusKHO>) => void;
}) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const khoValitusPvm = valitusKHO?.valitusPvm
    ? new Date(valitusKHO.valitusPvm)
    : null;
  const khoRatkaisuPvm = valitusKHO?.ratkaisuPvm
    ? new Date(valitusKHO.ratkaisuPvm)
    : null;

  return (
    <Stack gap={2}>
      <OphTypography variant={'h3'}>
        {t('hakemus.valitustiedot.valituskho.otsikko')}
      </OphTypography>
      <OphCheckbox
        data-testid="valituskho-valitettu-checkbox"
        label={t('hakemus.valitustiedot.valituskho.valitettu')}
        checked={valitusKHO?.valitettu ?? false}
        onChange={() => {
          if (valitusKHO?.valitettu) {
            updateValitusKHO({
              valitettu: false,
              valitusPvm: undefined,
              ratkaisuPvm: undefined,
            });
          } else {
            updateValitusKHO({ valitettu: true });
          }
        }}
      />
      {valitusKHO?.valitettu && (
        <Stack
          direction={'row'}
          marginTop={theme.spacing(1)}
          gap={theme.spacing(3)}
        >
          <CalendarComponent
            label={t('hakemus.valitustiedot.valituskho.valituspvm')}
            selectedValue={khoValitusPvm}
            minDate={null}
            maxDate={new Date()}
            setDate={(date) => {
              updateValitusKHO({
                valitusPvm: date ? date.toISOString() : undefined,
                ratkaisuPvm:
                  !date || (khoRatkaisuPvm && date > khoRatkaisuPvm)
                    ? undefined
                    : valitusKHO?.ratkaisuPvm,
              });
            }}
            dataTestId="valituskho-valituspvm-calendar"
          />
          <CalendarComponent
            label={t('hakemus.valitustiedot.valituskho.ratkaisupvm')}
            selectedValue={khoRatkaisuPvm}
            disabled={!khoValitusPvm}
            minDate={khoValitusPvm}
            maxDate={null}
            setDate={(date) => {
              updateValitusKHO({
                ratkaisuPvm: date ? date.toISOString() : undefined,
              });
            }}
            dataTestId="valituskho-ratkaisupvm-calendar"
          />
        </Stack>
      )}
    </Stack>
  );
};
