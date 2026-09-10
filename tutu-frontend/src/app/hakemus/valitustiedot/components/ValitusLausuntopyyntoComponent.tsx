import { Stack } from '@mui/material';
import { OphInputFormField } from '@opetushallitus/oph-design-system';
import React from 'react';

import { CalendarComponent } from '@/src/components/calendar-component';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ValitusLausuntopyynto } from '@/src/lib/types/valitustiedot';

export const ValitusLausuntopyyntoComponent = ({
  namespace,
  lausuntopyynto,
  updateLausuntopyynto,
}: {
  namespace: 'valituskho' | 'valitushao';
  lausuntopyynto?: ValitusLausuntopyynto;
  updateLausuntopyynto: (valitustiedot: Partial<ValitusLausuntopyynto>) => void;
}) => {
  const { t } = useTranslations();

  const saapumisPvm = lausuntopyynto?.saapumisPvm
    ? new Date(lausuntopyynto.saapumisPvm)
    : null;
  const maaraaikaPvm = lausuntopyynto?.maaraAikaPvm
    ? new Date(lausuntopyynto.maaraAikaPvm)
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
    <>
      <OphInputFormField
        label={t('hakemus.valitustiedot.lausuntopyynto.ashaTunnus')}
        value={lausuntopyynto?.ashaTunnus ?? ''}
        onChange={(e) => {
          updateLausuntopyynto({ ashaTunnus: e.target.value });
        }}
        data-testid={`${namespace}-ashatunnus-input`}
      />
      <Stack direction={'row'} spacing={3}>
        <CalendarComponent
          sx={calendarLabelSx}
          label={t(
            'hakemus.valitustiedot.lausuntopyynto.lausuntopyynnonSaapumisPvm',
          )}
          selectedValue={saapumisPvm}
          minDate={null}
          maxDate={new Date()}
          setDate={(date) => {
            updateLausuntopyynto({
              saapumisPvm: date ? date.toISOString() : undefined,
              maaraAikaPvm:
                !date || (maaraaikaPvm && date > maaraaikaPvm)
                  ? undefined
                  : lausuntopyynto?.maaraAikaPvm,
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
            'hakemus.valitustiedot.lausuntopyynto.lausunnonMaaraaikaPvm',
          )}
          selectedValue={maaraaikaPvm}
          disabled={!saapumisPvm}
          minDate={saapumisPvm}
          maxDate={null}
          setDate={(date) => {
            updateLausuntopyynto({
              maaraAikaPvm: date ? date.toISOString() : undefined,
            });
          }}
          dataTestId={`${namespace}-lausunnonmaaraaikapvm-calendar`}
        />
        <CalendarComponent
          sx={calendarLabelSx}
          label={t('hakemus.valitustiedot.lausuntopyynto.lausuntoAnnettuPvm')}
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
  );
};
