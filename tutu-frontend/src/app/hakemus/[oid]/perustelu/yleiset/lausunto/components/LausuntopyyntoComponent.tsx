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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const updateCurrentLausuntopyynto = (fieldValue: Partial<Lausuntopyynto>) => {
    const updatedLausuntopyynto: Lausuntopyynto = {
      ...lausuntopyynto,
      ...fieldValue,
    };
    updateLausuntopyyntoAction(updatedLausuntopyynto);
  };

  const closeModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    deleteLausuntopyyntoAction(lausuntopyynto.jarjestys!);
    closeModal();
  };

  const lahetetty = lausuntopyynto.lahetetty
    ? new Date(lausuntopyynto.lahetetty)
    : null;
  const saapunut = lausuntopyynto.saapunut
    ? new Date(lausuntopyynto.saapunut)
    : null;

  return (
    <Stack gap={theme.spacing(3)}>
      <ModalComponent
        open={deleteModalOpen}
        header={t('hakemus.perustelu.lausuntotiedot.modal.otsikko')}
        content={t('hakemus.perustelu.lausuntotiedot.modal.teksti')}
        confirmButtonText={t(
          'hakemus.perustelu.lausuntotiedot.poistaLausuntopyynto',
        )}
        handleConfirm={confirmDelete}
        handleClose={closeModal}
        t={t}
      />
      <Stack direction="row" justifyContent="space-between">
        <OphTypography
          variant={'h4'}
          data-testid={`lausuntopyynto-otsikko-${lausuntopyynto.jarjestys}`}
        >
          {t('hakemus.perustelu.lausuntotiedot.lausuntopyynto', '', {
            numero: lausuntopyynto.jarjestys,
          })}
        </OphTypography>
        {lausuntopyynto.jarjestys !== 1 && (
          <OphButton
            sx={{
              alignSelf: 'flex-end',
            }}
            data-testid={`poista-lausuntopyynto-button-${lausuntopyynto.jarjestys}`}
            variant="text"
            startIcon={<DeleteOutline />}
            onClick={() => setDeleteModalOpen(true)}
          >
            {t('hakemus.perustelu.lausuntotiedot.poistaLausuntopyynto')}
          </OphButton>
        )}
      </Stack>
      <OphInputFormField
        label={t('hakemus.perustelu.lausuntotiedot.lausunnonAntaja')}
        value={lausuntopyynto.lausunnonAntaja || ''}
        onChange={(e) =>
          updateCurrentLausuntopyynto({ lausunnonAntaja: e.target.value })
        }
        inputProps={{
          'data-testid': `lausunnon-antaja-${lausuntopyynto.jarjestys}`,
        }}
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
