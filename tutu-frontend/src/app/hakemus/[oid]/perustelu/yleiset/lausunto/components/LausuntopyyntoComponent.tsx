import { DeleteOutline } from '@mui/icons-material';
import { Stack } from '@mui/material';
import { Theme } from '@mui/material/styles';
import {
  OphButton,
  OphInputFormField,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import * as dateFns from 'date-fns';
import React from 'react';

import { CalendarComponent } from '@/src/components/calendar-component';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { OphSelectOption } from '@/src/components/OphSelect';
import { DATE_TIME_STANDARD_PLACEHOLDER } from '@/src/constants/constants';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Lausuntopyynto } from '@/src/lib/types/lausuntotieto';

export type LausuntopyyntoProps = {
  lausuntopyynto: Lausuntopyynto;
  updateLausuntopyyntoAction: (lausuntopyynto: Lausuntopyynto) => void;
  deleteLausuntopyyntoAction: (jarjestysnumero: number) => void;
  korkeakouluOptions: OphSelectOption<string>[];
  isKoodistoLoading: boolean;
  t: TFunction;
  theme: Theme;
};
export const LausuntopyyntoComponent = ({
  lausuntopyynto,
  updateLausuntopyyntoAction,
  deleteLausuntopyyntoAction,
  korkeakouluOptions,
  isKoodistoLoading,
  t,
  theme,
}: LausuntopyyntoProps) => {
  const { showConfirmation } = useGlobalConfirmationModal();

  const updateCurrentLausuntopyynto = (fieldValue: Partial<Lausuntopyynto>) => {
    const updatedLausuntopyynto: Lausuntopyynto = {
      ...lausuntopyynto,
      ...fieldValue,
    };
    updateLausuntopyyntoAction(updatedLausuntopyynto);
  };

  const isValidOption = (value: string | null) => {
    if (!value) return false;
    return korkeakouluOptions.some((option) => option.value === value);
  };

  const isMuuSelected =
    !lausuntopyynto.lausunnonAntajaKoodiUri &&
    lausuntopyynto.lausunnonAntajaMuu !== null;
  const currentValue = isMuuSelected
    ? 'muu'
    : isValidOption(lausuntopyynto.lausunnonAntajaKoodiUri)
      ? lausuntopyynto.lausunnonAntajaKoodiUri
      : '';

  const lahetetty = lausuntopyynto.lahetetty
    ? new Date(lausuntopyynto.lahetetty)
    : null;
  const saapunut = lausuntopyynto.saapunut
    ? new Date(lausuntopyynto.saapunut)
    : null;

  return (
    <Stack gap={theme.spacing(3)}>
      <Stack direction="row" justifyContent="space-between">
        <OphTypography
          variant={'h4'}
          data-testid={`lausuntopyynto-otsikko-${lausuntopyynto.jarjestys}`}
        >
          {t('hakemus.perustelu.lausuntotiedot.lausuntopyynto', '', {
            numero: lausuntopyynto.jarjestys,
          })}
        </OphTypography>
        <OphButton
          sx={{
            alignSelf: 'flex-end',
          }}
          data-testid={`poista-lausuntopyynto-button-${lausuntopyynto.jarjestys}`}
          variant="text"
          startIcon={<DeleteOutline />}
          onClick={() =>
            showConfirmation({
              header: t('hakemus.perustelu.lausuntotiedot.modal.otsikko'),
              content: t('hakemus.perustelu.lausuntotiedot.modal.otsikko'),
              confirmButtonText: t(
                'hakemus.perustelu.lausuntotiedot.poistaLausuntopyynto',
              ),
              handleConfirmAction: () =>
                deleteLausuntopyyntoAction(lausuntopyynto.jarjestys!),
            })
          }
        >
          {t('hakemus.perustelu.lausuntotiedot.poistaLausuntopyynto')}
        </OphButton>
      </Stack>
      <OphSelectFormField
        label={t('hakemus.perustelu.lausuntotiedot.lausunnonAntaja')}
        value={currentValue || ''}
        options={korkeakouluOptions}
        onChange={(e) => {
          const value = e.target.value;
          updateCurrentLausuntopyynto({
            lausunnonAntajaKoodiUri: value === 'muu' ? null : value,
            lausunnonAntajaMuu:
              value === 'muu' ? lausuntopyynto.lausunnonAntajaMuu || '' : null,
          });
        }}
        disabled={isKoodistoLoading}
        data-testid={`lausunnon-antaja-${lausuntopyynto.jarjestys}`}
      />
      {isMuuSelected && (
        <OphInputFormField
          label={t('hakemus.perustelu.lausuntotiedot.muuLausunnonAntaja')}
          value={lausuntopyynto.lausunnonAntajaMuu || ''}
          onChange={(e) =>
            updateCurrentLausuntopyynto({ lausunnonAntajaMuu: e.target.value })
          }
          inputProps={{
            'data-testid': `muu-lausunnon-antaja-${lausuntopyynto.jarjestys}`,
          }}
        />
      )}
      <Stack direction="row" gap={theme.spacing(5)}>
        <CalendarComponent
          setDate={(date: Date | null) =>
            updateCurrentLausuntopyynto({
              lahetetty: date
                ? dateFns.format(date, DATE_TIME_STANDARD_PLACEHOLDER)
                : null,
            })
          }
          selectedValue={lahetetty}
          maxDate={saapunut}
          label={t('hakemus.perustelu.lausuntotiedot.pyyntoLahetetty')}
          dataTestId={`lausuntoPyyntoLahetetty-calendar-${lausuntopyynto.jarjestys}`}
        />
        <CalendarComponent
          setDate={(date: Date | null) =>
            updateCurrentLausuntopyynto({
              saapunut: date
                ? dateFns.format(date, DATE_TIME_STANDARD_PLACEHOLDER)
                : null,
            })
          }
          selectedValue={saapunut}
          minDate={lahetetty}
          label={t('hakemus.perustelu.lausuntotiedot.pyyntoSaapunut')}
          dataTestId={`lausuntoPyyntoVastattu-calendar-${lausuntopyynto.jarjestys}`}
        />
      </Stack>
    </Stack>
  );
};
