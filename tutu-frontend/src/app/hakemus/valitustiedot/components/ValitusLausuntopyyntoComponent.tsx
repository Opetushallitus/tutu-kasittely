import { Stack, useTheme } from '@mui/material';
import {
  OphCheckbox,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { CalendarComponent } from '@/src/components/calendar-component';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ValitusLausuntopyynto } from '@/src/lib/types/valitustiedot';

export const ValitusLausuntopyyntoComponent = ({
  namespace,
  lausuntopyynto,
  updateLausuntopyynto,
}: {
  namespace: 'valituskho' | 'valitusho';
  lausuntopyynto?: ValitusLausuntopyynto;
  updateLausuntopyynto: (valitustiedot: Partial<ValitusLausuntopyynto>) => void;
}) => {
  const { t } = useTranslations();
  const theme = useTheme();

  const saapumisPvm = lausuntopyynto?.lausuntopyynnonSaapumisPvm
    ? new Date(lausuntopyynto.lausuntopyynnonSaapumisPvm)
    : null;
  const maaraaikaPvm = lausuntopyynto?.lausunnonMaaraaikaPvm
    ? new Date(lausuntopyynto.lausunnonMaaraaikaPvm)
    : null;
  const annettuPvm = lausuntopyynto?.lausuntoAnnettuPvm
    ? new Date(lausuntopyynto.lausuntoAnnettuPvm)
    : null;

  // 3 CC:tä vierekkäin, estetään labelin rivitys niin pysyy siistinä
  const calendarLabelSx = {
    '& .MuiFormLabel-root': {
      whiteSpace: 'nowrap',
    },
  };

  return (
    <Stack gap={theme.spacing(3)}>
      <OphCheckbox
        data-testid={`${namespace}-lausuntopyynto-checkbox`}
        label={t(`hakemus.valitustiedot.${namespace}.lausuntopyynto`)}
        checked={lausuntopyynto?.lausuntopyynto ?? false}
        onChange={() => {
          if (lausuntopyynto?.lausuntopyynto) {
            updateLausuntopyynto({
              lausuntopyynto: false,
              ashaTunnus: undefined,
              lausuntopyynnonSaapumisPvm: undefined,
              lausunnonMaaraaikaPvm: undefined,
              lausuntoAnnettuPvm: undefined,
            });
          } else {
            updateLausuntopyynto({ lausuntopyynto: true });
          }
        }}
      />
      {lausuntopyynto?.lausuntopyynto && (
        <>
          <OphInputFormField
            label={t(`hakemus.valitustiedot.${namespace}.ashaTunnus`)}
            value={lausuntopyynto?.ashaTunnus ?? ''}
            onChange={(e) => {
              updateLausuntopyynto({ ashaTunnus: e.target.value });
            }}
            data-testid={`${namespace}-ashatunnus-input`}
          />
          <Stack direction={'row'} gap={theme.spacing(3)}>
            <CalendarComponent
              sx={calendarLabelSx}
              label={t(
                `hakemus.valitustiedot.${namespace}.lausuntopyynnonSaapumisPvm`,
              )}
              selectedValue={saapumisPvm}
              minDate={null}
              maxDate={new Date()}
              setDate={(date) => {
                updateLausuntopyynto({
                  lausuntopyynnonSaapumisPvm: date
                    ? date.toISOString()
                    : undefined,
                  lausunnonMaaraaikaPvm:
                    !date || (maaraaikaPvm && date > maaraaikaPvm)
                      ? undefined
                      : lausuntopyynto?.lausunnonMaaraaikaPvm,
                  lausuntoAnnettuPvm:
                    !date || (annettuPvm && date > annettuPvm)
                      ? undefined
                      : lausuntopyynto?.lausuntoAnnettuPvm,
                });
              }}
              dataTestId={`${namespace}-lausuntopyynnonsaapumispvm-calendar`}
            />
            <CalendarComponent
              sx={calendarLabelSx}
              label={t(
                `hakemus.valitustiedot.${namespace}.lausunnonMaaraaikaPvm`,
              )}
              selectedValue={maaraaikaPvm}
              disabled={!saapumisPvm}
              minDate={saapumisPvm}
              maxDate={null}
              setDate={(date) => {
                updateLausuntopyynto({
                  lausunnonMaaraaikaPvm: date ? date.toISOString() : undefined,
                });
              }}
              dataTestId={`${namespace}-lausunnonmaaraaikapvm-calendar`}
            />
            <CalendarComponent
              sx={calendarLabelSx}
              label={t(`hakemus.valitustiedot.${namespace}.lausuntoAnnettuPvm`)}
              selectedValue={annettuPvm}
              disabled={!saapumisPvm}
              minDate={saapumisPvm}
              maxDate={null}
              setDate={(date) => {
                updateLausuntopyynto({
                  lausuntoAnnettuPvm: date ? date.toISOString() : undefined,
                });
              }}
              dataTestId={`${namespace}-lausuntoannettupvm-calendar`}
            />
          </Stack>
        </>
      )}
    </Stack>
  );
};
