'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { Tutkinto } from '@/src/lib/types/hakemus';
import { Option } from '@/src/constants/dropdownOptions';
import {
  OphButton,
  OphInputFormField,
  OphSelectFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';
import { Divider, Stack } from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';
import { ModalComponent } from '@/src/components/ModalComponent';

export type TutkintoProps = {
  tutkinto: Tutkinto;
  maatJaValtiotOptions: Option[];
  koulutusLuokitusOptions: Option[];
  updateTutkintoAction: (tutkinto: Tutkinto) => void;
  deleteTutkintoAction: (id: string | undefined) => void;
  t: TFunction;
};

export const TutkintoComponent = ({
  tutkinto,
  maatJaValtiotOptions,
  koulutusLuokitusOptions,
  updateTutkintoAction,
  deleteTutkintoAction,
  t,
}: TutkintoProps) => {
  const [currentTutkinto, setCurrentTutkinto] =
    React.useState<Tutkinto>(tutkinto);
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);

  const updateCurrentTutkinto = (value: Tutkinto) => {
    updateTutkintoAction(value);
    setCurrentTutkinto(value);
  };
  const closeModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = () => {
    deleteTutkintoAction(tutkinto.id);
    closeModal();
  };
  return (
    <Stack direction="column" gap={2}>
      <ModalComponent
        open={deleteModalOpen}
        header={t('hakemus.tutkinnot.modal.otsikko')}
        content={t('hakemus.tutkinnot.modal.teksti')}
        handleConfirm={confirmDelete}
        handleClose={closeModal}
        t={t}
      />
      <Stack direction="row" justifyContent="space-between">
        <OphTypography
          variant={'h2'}
          data-testid={`tutkinto-otsikko-${tutkinto.jarjestys}`}
        >
          {t('hakemus.tutkinnot.tutkinto.tutkintoOtsikko')}{' '}
          {currentTutkinto.jarjestys}
        </OphTypography>
        {currentTutkinto.jarjestys !== '1' && (
          <OphButton
            sx={{
              alignSelf: 'flex-end',
            }}
            data-testid={`poista-tutkinto-button-${currentTutkinto.jarjestys}`}
            variant="text"
            startIcon={<DeleteOutline />}
            onClick={() => setDeleteModalOpen(true)}
          >
            {t('hakemus.tutkinnot.poistaTutkinto')}
          </OphButton>
        )}
      </Stack>
      <OphSelectFormField
        label={t('hakemus.tutkinnot.tutkinto.tutkintoTodistusOtsikko')}
        options={[]}
        defaultValue={''}
        data-testid={`tutkinto-todistusotsikko-${tutkinto.jarjestys}`}
      />
      <OphInputFormField
        label={t('hakemus.tutkinnot.tutkinto.tutkinnonNimi')}
        onChange={(event) =>
          updateCurrentTutkinto({
            ...currentTutkinto,
            nimi: event.target.value,
          })
        }
        value={currentTutkinto.nimi}
        inputProps={{
          'data-testid': `tutkinto-tutkintonimi-${tutkinto.jarjestys}`,
        }}
      />
      <OphInputFormField
        label={t('hakemus.tutkinnot.tutkinto.tutkinnonPaaaineTaiErikoisala')}
        onChange={(event) =>
          updateCurrentTutkinto({
            ...currentTutkinto,
            paaaaineTaiErikoisala: event.target.value,
          })
        }
        value={currentTutkinto.paaaaineTaiErikoisala || ''}
        inputProps={{
          'data-testid': `tutkinto-paaaine-${tutkinto.jarjestys}`,
        }}
      />
      <OphSelectFormField
        label={t('hakemus.tutkinnot.tutkinto.tutkinnonMaa')}
        sx={{ width: '50%' }}
        options={maatJaValtiotOptions}
        value={String(currentTutkinto.maakoodi) || ''}
        onChange={(event) =>
          updateCurrentTutkinto({
            ...currentTutkinto,
            maakoodi: event.target.value,
          })
        }
        data-testid={`tutkinto-maa-${tutkinto.jarjestys}`}
      />
      <Stack direction="row" gap={2}>
        <OphInputFormField
          sx={{ width: '25%' }}
          label={t('hakemus.tutkinnot.tutkinto.opintojenAloitusVuosi')}
          onChange={(event) =>
            updateCurrentTutkinto({
              ...currentTutkinto,
              aloitusVuosi: Number(event.target.value),
            })
          }
          value={currentTutkinto.aloitusVuosi || ''}
          inputProps={{
            'data-testid': `tutkinto-aloitusvuosi-${tutkinto.jarjestys}`,
          }}
        />
        <OphInputFormField
          sx={{ width: '25%' }}
          label={t('hakemus.tutkinnot.tutkinto.opintojenPaattymisVuosi')}
          onChange={(event) =>
            updateCurrentTutkinto({
              ...currentTutkinto,
              paattymisVuosi: Number(event.target.value),
            })
          }
          value={currentTutkinto.paattymisVuosi || ''}
          inputProps={{
            'data-testid': `tutkinto-paattymisvuosi-${tutkinto.jarjestys}`,
          }}
        />
      </Stack>
      <OphInputFormField
        sx={{ width: '25%' }}
        label={t('hakemus.tutkinnot.tutkinto.todistuksenPvm')}
        onChange={(event) =>
          updateCurrentTutkinto({
            ...currentTutkinto,
            todistuksenPaivamaara: event.target.value,
          })
        }
        value={currentTutkinto.todistuksenPaivamaara || ''}
        inputProps={{
          'data-testid': `tutkinto-todistuksenpvm-${tutkinto.jarjestys}`,
        }}
      />
      <OphSelectFormField
        label={t('hakemus.tutkinnot.tutkinto.tutkinnonKoulutusala')}
        sx={{ width: '25%' }}
        options={koulutusLuokitusOptions}
        onChange={(event) =>
          updateCurrentTutkinto({
            ...currentTutkinto,
            koulutusalaKoodi: event.target.value,
          })
        }
        value={currentTutkinto.koulutusalaKoodi || ''}
        data-testid={`tutkinto-koulutusala-${tutkinto.jarjestys}`}
      />
      <Divider orientation={'horizontal'} />
    </Stack>
  );
};
