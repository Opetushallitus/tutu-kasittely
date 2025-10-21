import {
  AsiakirjaTieto,
  AsiakirjaTietoUpdateCallback,
  ValmistumisenVahvistus,
  ValmistumisenVahvistusVastaus,
} from '@/src/lib/types/hakemus';
import { Stack, useTheme } from '@mui/material';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import {
  OphCheckbox,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { CalendarComponent } from '@/src/components/calendar-component';
import * as dateFns from 'date-fns';
import { OphRadioOption } from '@/src/lib/types/common';
import { OphRadioGroupFormFieldWithClear } from '@/src/components/OphRadioGroupFormFieldWithClear';

type RadioGroupFormFieldChangeEventHandler = {
  (event: React.FormEvent<HTMLDivElement>): void;
  (event: ChangeEvent<HTMLInputElement>, value: string): void;
};

export const ValmistumisenVahvistusComponent = ({
  asiakirjaTieto,
  instantUpdateAsiakirjaTietoAction,
  debouncedUpdateAsiakirjaTietoAction,
}: {
  asiakirjaTieto: AsiakirjaTieto;
  instantUpdateAsiakirjaTietoAction: AsiakirjaTietoUpdateCallback;
  debouncedUpdateAsiakirjaTietoAction: AsiakirjaTietoUpdateCallback;
}) => {
  const theme = useTheme();
  const { t } = useTranslations();

  const [valmistumisenVahvistus, setValmistumisenVahvistus] =
    useState<ValmistumisenVahvistus>(asiakirjaTieto.valmistumisenVahvistus);

  useEffect(() => {
    setValmistumisenVahvistus(asiakirjaTieto.valmistumisenVahvistus);
  }, [asiakirjaTieto.valmistumisenVahvistus]);

  const setField = <K extends keyof ValmistumisenVahvistus>(
    key: K,
    value: ValmistumisenVahvistus[K],
  ) => {
    const updatedValmistumisenVahvistus = {
      ...valmistumisenVahvistus,
      [key]: value,
    } as ValmistumisenVahvistus;
    setValmistumisenVahvistus(updatedValmistumisenVahvistus);
    if (key === 'valmistumisenVahvistusLisatieto') {
      debouncedUpdateAsiakirjaTietoAction({
        valmistumisenVahvistus: updatedValmistumisenVahvistus,
      });
    } else {
      instantUpdateAsiakirjaTietoAction({
        valmistumisenVahvistus: updatedValmistumisenVahvistus,
      });
    }
  };

  const updateVahvistusPyyntoLahetetty = (date: Date | null) => {
    setField(
      'valmistumisenVahvistusPyyntoLahetetty',
      date ? dateFns.format(date, "yyyy-MM-dd'T'HH:mm") : null,
    );
  };

  const updateVahvistusPyyntoVastattu = (date: Date | null) => {
    setField(
      'valmistumisenVahvistusSaatu',
      date ? dateFns.format(date, "yyyy-MM-dd'T'HH:mm") : null,
    );
  };

  const vahvistusVastausOptions: OphRadioOption<ValmistumisenVahvistusVastaus>[] =
    [
      {
        value: 'Myonteinen',
        label: t('hakemus.asiakirjat.valmistumisenVahvistus.myonteinen'),
      },
      {
        value: 'Kielteinen',
        label: t('hakemus.asiakirjat.valmistumisenVahvistus.kielteinen'),
      },
      {
        value: 'EiVastausta',
        label: t('hakemus.asiakirjat.valmistumisenVahvistus.eiVastausta'),
      },
    ];

  const lisatietoLabel = (vastaus: ValmistumisenVahvistusVastaus | null) => {
    switch (vastaus) {
      case 'Myonteinen':
        return t(
          'hakemus.asiakirjat.valmistumisenVahvistus.myonteinenLisatieto',
        );
      case 'Kielteinen':
        return t(
          'hakemus.asiakirjat.valmistumisenVahvistus.kielteinenLisatieto',
        );
      default:
        return t(
          'hakemus.asiakirjat.valmistumisenVahvistus.eiVastaustaLisatieto',
        );
    }
  };

  const pyyntoLahetetty =
    valmistumisenVahvistus.valmistumisenVahvistusPyyntoLahetetty
      ? new Date(valmistumisenVahvistus.valmistumisenVahvistusPyyntoLahetetty)
      : null;
  const pyyntoVastattu = valmistumisenVahvistus.valmistumisenVahvistusSaatu
    ? new Date(valmistumisenVahvistus.valmistumisenVahvistusSaatu)
    : null;

  const radioGroupChangeHandler: RadioGroupFormFieldChangeEventHandler = (
    _event: React.FormEvent<HTMLDivElement> | ChangeEvent<HTMLInputElement>,
    value?: string,
  ) => {
    if (value) {
      setField(
        'valmistumisenVahvistusVastaus',
        value as ValmistumisenVahvistusVastaus,
      );
    }
  };

  return (
    <Stack direction="column" spacing={theme.spacing(2)}>
      <OphCheckbox
        label={t('hakemus.asiakirjat.valmistumisenVahvistus.otsikko')}
        data-testid="valmistumisen-vahvistus-checkbox"
        checked={valmistumisenVahvistus.valmistumisenVahvistus}
        onChange={() => {
          const newValue = !valmistumisenVahvistus.valmistumisenVahvistus;
          // Jos checkbox poistetaan käytöstä, tyhjennä myös päivämäärät
          const updatedValmistumisenVahvistus = newValue
            ? {
                ...valmistumisenVahvistus,
                valmistumisenVahvistus: newValue,
              }
            : {
                valmistumisenVahvistus: false,
                valmistumisenVahvistusPyyntoLahetetty: null,
                valmistumisenVahvistusSaatu: null,
                valmistumisenVahvistusVastaus: null,
                valmistumisenVahvistusLisatieto: null,
              };
          setValmistumisenVahvistus(updatedValmistumisenVahvistus);
          instantUpdateAsiakirjaTietoAction({
            valmistumisenVahvistus: updatedValmistumisenVahvistus,
          });
        }}
      />
      {valmistumisenVahvistus.valmistumisenVahvistus && (
        <Stack
          direction="column"
          spacing={theme.spacing(2)}
          marginLeft={theme.spacing(4)}
        >
          <Stack direction="row" spacing={theme.spacing(2)} width="100%">
            <CalendarComponent
              setDate={updateVahvistusPyyntoLahetetty}
              selectedValue={pyyntoLahetetty}
              maxDate={pyyntoVastattu}
              label={t('hakemus.asiakirjat.valmistumisenVahvistus.lahetetty')}
              dataTestId="vahvistusPyyntoLahetetty-calendar"
            />
            <OphTypography variant="label"></OphTypography>
            <CalendarComponent
              setDate={updateVahvistusPyyntoVastattu}
              selectedValue={pyyntoVastattu}
              label={t(
                'hakemus.asiakirjat.valmistumisenVahvistus.vastaanotettu',
              )}
              minDate={pyyntoLahetetty}
              dataTestId="vahvistusPyyntoVastattu-calendar"
            />
          </Stack>
          <OphRadioGroupFormFieldWithClear
            label={t('hakemus.asiakirjat.valmistumisenVahvistus.vastaus')}
            data-testid="valmistumisenVahvistus-radio-group"
            sx={{ width: '100%' }}
            options={vahvistusVastausOptions}
            row
            value={
              valmistumisenVahvistus.valmistumisenVahvistusVastaus?.toString() ??
              ''
            }
            onChange={radioGroupChangeHandler}
            onClear={() => setField('valmistumisenVahvistusVastaus', null)}
          />
          {valmistumisenVahvistus.valmistumisenVahvistusVastaus && (
            <OphInputFormField
              sx={{
                width: '100%',
              }}
              label={lisatietoLabel(
                valmistumisenVahvistus.valmistumisenVahvistusVastaus,
              )}
              value={
                valmistumisenVahvistus.valmistumisenVahvistusLisatieto || ''
              }
              onChange={(event) =>
                setField('valmistumisenVahvistusLisatieto', event.target.value)
              }
              data-testid="valmistumisenVahvistus-lisatieto-input"
            />
          )}
        </Stack>
      )}
    </Stack>
  );
};
