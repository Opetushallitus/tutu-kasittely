'use client';

import {
  AsiakirjaTietoUpdateCallback,
  ImiPyynto,
} from '@/src/lib/types/hakemus';
import { Stack } from '@mui/material';
import EditOffIcon from '@mui/icons-material/EditOff';
import {
  ophColors,
  OphInputFormField,
  OphRadioGroup,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { styled } from '@/src/lib/theme';
import { IconButton } from '@/src/components/IconButton';
import * as dateFns from 'date-fns';
import { CalendarComponent } from '@/src/components/calendar-component';
import { OphRadioOption } from '@/src/lib/types/common';

interface ImiPyyntoProps {
  imiPyynto: ImiPyynto;
  updateAsiakirjaTietoAction: AsiakirjaTietoUpdateCallback;
}

const StyledEditOffIcon = styled(EditOffIcon)({
  color: ophColors.blue2,
});

export const ImiPyyntoComponent = ({
  imiPyynto,
  updateAsiakirjaTietoAction,
}: ImiPyyntoProps) => {
  const { t } = useTranslations();

  const [currentImiPyynto, setCurrentImiPyynto] =
    React.useState<ImiPyynto>(imiPyynto);

  React.useEffect(() => {
    setCurrentImiPyynto(imiPyynto);
  }, [imiPyynto]);

  const setField = <K extends keyof ImiPyynto>(key: K, value: ImiPyynto[K]) => {
    const updatedImiPyynto = { ...currentImiPyynto, [key]: value } as ImiPyynto;
    setCurrentImiPyynto(updatedImiPyynto);
    updateAsiakirjaTietoAction({ imiPyynto: updatedImiPyynto });
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

  return (
    <Stack direction="column" spacing={2}>
      <OphTypography variant="h2" data-testid="imiPyynto-otsikko">
        {t('hakemus.asiakirjat.imiPyynnot.otsikko')}
      </OphTypography>

      <Stack direction="row">
        <OphTypography variant="label">
          {t('hakemus.asiakirjat.imiPyynnot.imiPyyntoQuestion')}
        </OphTypography>
        <IconButton
          data-testid="imiPyynto-delete"
          onClick={() => setField('imiPyynto', null)}
        >
          <StyledEditOffIcon />
        </IconButton>
      </Stack>

      <Stack direction="column" spacing={2}>
        <OphRadioGroup
          labelId="imiPyynto-radio-group-label"
          data-testid="imiPyynto-radio-group"
          sx={{ width: '100%' }}
          options={imiPyyntoOptions}
          row
          value={currentImiPyynto.imiPyynto?.toString() ?? ''}
          onChange={(e) => setField('imiPyynto', e.target.value === 'true')}
        />
      </Stack>

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
              selectedValue={
                currentImiPyynto.imiPyyntoLahetetty
                  ? new Date(currentImiPyynto.imiPyyntoLahetetty)
                  : null
              }
              label={t('hakemus.asiakirjat.imiPyynnot.imiPyyntoLahetetty')}
              dataTestId="imiPyyntoLahetetty-calendar"
            />
            <OphTypography variant="label"></OphTypography>
            <CalendarComponent
              dataTestId="imiPyyntoVastattu-calendar"
              setDate={updateImiPyyntoVastattu}
              selectedValue={
                currentImiPyynto.imiPyyntoVastattu
                  ? new Date(currentImiPyynto.imiPyyntoVastattu)
                  : null
              }
              label={t('hakemus.asiakirjat.imiPyynnot.imiPyyntoVastattu')}
            />
          </Stack>
        </>
      )}
    </Stack>
  );
};
