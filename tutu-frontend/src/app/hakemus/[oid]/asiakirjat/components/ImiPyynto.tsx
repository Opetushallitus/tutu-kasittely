'use client';

import {
  AsiakirjaTietoUpdateCallback,
  ImiPyynto,
} from '@/src/lib/types/hakemus';
import { Stack } from '@mui/material';
import {
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import * as dateFns from 'date-fns';
import { CalendarComponent } from '@/src/components/calendar-component';
import { OphRadioOption } from '@/src/lib/types/common';
import { OphRadioGroupWithClear } from '@/src/components/OphRadioGroupWithClear';

interface ImiPyyntoProps {
  imiPyynto: ImiPyynto;
  updateAsiakirjaTieto: AsiakirjaTietoUpdateCallback;
}

export const ImiPyyntoComponent = ({
  imiPyynto,
  updateAsiakirjaTieto,
}: ImiPyyntoProps) => {
  const { t } = useTranslations();

  const currentImiPyynto = imiPyynto;

  const setField = <K extends keyof ImiPyynto>(key: K, value: ImiPyynto[K]) => {
    const updatedImiPyynto = { ...currentImiPyynto, [key]: value } as ImiPyynto;
    updateAsiakirjaTieto({ imiPyynto: updatedImiPyynto });
  };

  const updateImiPyyntoLahetetty = (date: Date | null) => {
    setField(
      'imiPyyntoLahetetty',
      date ? dateFns.format(date, "yyyy-MM-dd'T'HH:mm") : '',
    );
  };

  const updateImiPyyntoVastattu = (date: Date | null) => {
    setField(
      'imiPyyntoVastattu',
      date ? dateFns.format(date, "yyyy-MM-dd'T'HH:mm") : '',
    );
  };

  const imiPyyntoOptions: OphRadioOption<string>[] = [
    { value: 'true', label: t('yleiset.kylla') },
    { value: 'false', label: t('yleiset.ei') },
  ];

  const pyyntoLahetetty = currentImiPyynto.imiPyyntoLahetetty
    ? new Date(currentImiPyynto.imiPyyntoLahetetty)
    : null;
  const pyyntoVastattu = currentImiPyynto.imiPyyntoVastattu
    ? new Date(currentImiPyynto.imiPyyntoVastattu)
    : null;

  return (
    <Stack direction="column" spacing={2}>
      <OphTypography variant="h2" data-testid="imiPyynto-otsikko">
        {t('hakemus.asiakirjat.imiPyynnot.otsikko')}
      </OphTypography>

      <OphRadioGroupWithClear
        label={t('hakemus.asiakirjat.imiPyynnot.imiPyyntoQuestion')}
        labelId="imiPyynto-radio-group-label"
        labelVariant="label"
        data-testid="imiPyynto-radio-group"
        sx={{ width: '100%' }}
        options={imiPyyntoOptions}
        row
        value={currentImiPyynto.imiPyynto?.toString() ?? ''}
        onChange={(e) => {
          const newValue = e.target.value === 'true';
          const updatedImiPyynto = newValue
            ? { ...currentImiPyynto, imiPyynto: newValue }
            : {
                imiPyynto: false,
                imiPyyntoNumero: null,
                imiPyyntoLahetetty: null,
                imiPyyntoVastattu: null,
              };
          updateAsiakirjaTieto({ imiPyynto: updatedImiPyynto });
        }}
        onClear={() => setField('imiPyynto', null)}
      />

      {currentImiPyynto.imiPyynto && (
        <>
          <OphInputFormField
            label={t('hakemus.asiakirjat.imiPyynnot.imiPyyntoNumero')}
            data-testid="imiPyyntoNumero-input"
            sx={{ width: '95%' }}
            value={currentImiPyynto.imiPyyntoNumero || ''}
            onChange={(e) => setField('imiPyyntoNumero', e.target.value)}
          />
          <Stack direction="row" spacing={2}>
            <CalendarComponent
              setDate={updateImiPyyntoLahetetty}
              selectedValue={pyyntoLahetetty}
              maxDate={pyyntoVastattu}
              label={t('hakemus.asiakirjat.imiPyynnot.imiPyyntoLahetetty')}
              dataTestId="imiPyyntoLahetetty-calendar"
            />
            <OphTypography variant="label"></OphTypography>
            <CalendarComponent
              dataTestId="imiPyyntoVastattu-calendar"
              setDate={updateImiPyyntoVastattu}
              selectedValue={pyyntoVastattu}
              minDate={pyyntoLahetetty}
              label={t('hakemus.asiakirjat.imiPyynnot.imiPyyntoVastattu')}
            />
          </Stack>
        </>
      )}
    </Stack>
  );
};
