import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Stack } from '@mui/material';
import { Lausuntopyynto } from '@/src/lib/types/lausuntotieto';
import { Theme } from '@mui/material/styles';
import {
  OphButton,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useState } from 'react';
import { CalendarComponent } from '@/src/components/calendar-component';
import * as dateFns from 'date-fns';
import { DATE_TIME_STANDARD_PLACEHOLDER } from '@/src/constants/constants';
import { ModalComponent } from '@/src/components/ModalComponent';
import { DeleteOutline } from '@mui/icons-material';

export type LausuntopyyntoProps = {
  lausuntopyynto: Lausuntopyynto;
  updateLausuntopyyntoAction: (lausuntopyynto: Lausuntopyynto) => void;
  deleteLausuntopyyntoAction: (jarjestysnumero: number) => void;
  t: TFunction;
  theme: Theme;
};
export const LausuntopyyntoComponent = ({
  lausuntopyynto,
  updateLausuntopyyntoAction,
  deleteLausuntopyyntoAction,
  t,
  theme,
}: LausuntopyyntoProps) => {
  const [currentLausuntopyynto, setCurrentLausuntopyynto] =
    useState<Lausuntopyynto>(lausuntopyynto);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const updateCurrentLausuntopyynto = (fieldValue: Partial<Lausuntopyynto>) => {
    const updatedLausuntopyynto: Lausuntopyynto = {
      ...currentLausuntopyynto,
      ...fieldValue,
    };
    updateLausuntopyyntoAction(updatedLausuntopyynto);
    setCurrentLausuntopyynto(updatedLausuntopyynto);
  };

  const closeModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    deleteLausuntopyyntoAction(lausuntopyynto.jarjestys);
    closeModal();
  };

  const lahetetty = currentLausuntopyynto.lahetetty
    ? new Date(currentLausuntopyynto.lahetetty)
    : null;
  const saapunut = currentLausuntopyynto.saapunut
    ? new Date(currentLausuntopyynto.saapunut)
    : null;

  return (
    <Stack gap={theme.spacing(3)}>
      <ModalComponent
        open={deleteModalOpen}
        header={t('hakemus.perustelu.yleiset.lausuntotiedot.modal.otsikko')}
        content={t('hakemus.perustelu.yleiset.lausuntotiedot.modal.teksti')}
        handleConfirm={confirmDelete}
        handleClose={closeModal}
        t={t}
      />
      <Stack direction="row" justifyContent="space-between">
        <OphTypography variant={'h4'}>
          {t('hakemus.perustelu.yleiset.lausuntotiedot.lausuntopyynto', '', {
            numero: lausuntopyynto.jarjestys,
          })}
        </OphTypography>
        {currentLausuntopyynto.jarjestys !== 1 && (
          <OphButton
            sx={{
              alignSelf: 'flex-end',
            }}
            data-testid={`poista-lausuntopyynto-button-${currentLausuntopyynto.jarjestys}`}
            variant="text"
            startIcon={<DeleteOutline />}
            onClick={() => setDeleteModalOpen(true)}
          >
            {t('hakemus.perustelu.yleiset.lausuntotiedot.poistaLausuntopyynto')}
          </OphButton>
        )}
      </Stack>
      <OphInputFormField
        label={t('hakemus.perustelu.yleiset.lausuntotiedot.lausunnonAntaja')}
      />
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
          label={t('hakemus.perustelu.yleiset.lausuntotiedot.pyyntoLahetetty')}
          dataTestId="lausuntoPyyntoLahetetty-calendar"
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
          label={t('hakemus.perustelu.yleiset.lausuntotiedot.pyyntoSaapunut')}
          dataTestId="lausuntoPyyntoVastattu-calendar"
        />
      </Stack>
    </Stack>
  );
};
