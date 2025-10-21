'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { PaatosTieto } from '@/src/lib/types/paatos';
import { Divider, Stack, useTheme } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { DeleteOutline } from '@mui/icons-material';
import { PaatosTietoComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosTietoComponent';
import React from 'react';
import { Tutkinto } from '@/src/lib/types/hakemus';
import { ModalComponent } from '@/src/components/ModalComponent';

interface PaatosTietoListProps {
  t: TFunction;
  paatosTiedot: PaatosTieto[];
  updatePaatosTietoAction: (
    updatedPaatosTieto: PaatosTieto,
    index: number,
  ) => void;
  deletePaatosTieto: (id: string | undefined) => void;
  tutkinnot: Tutkinto[];
}

export const PaatosTietoList = ({
  t,
  paatosTiedot,
  updatePaatosTietoAction,
  deletePaatosTieto,
  tutkinnot,
}: PaatosTietoListProps) => {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const theme = useTheme();

  const closeModal = () => {
    setDeleteModalOpen(false);
  };

  const confirmDelete = (id: string | undefined) => {
    deletePaatosTieto(id);
    closeModal();
  };
  return (
    <>
      {paatosTiedot.map((paatosTieto, index) => (
        <Stack key={index} direction={'column'} gap={theme.spacing(2)}>
          <ModalComponent
            open={deleteModalOpen}
            header={t('hakemus.paatos.modal.otsikko')}
            content={t('hakemus.paatos.modal.teksti')}
            confirmButtonText={t('hakemus.paatos.modal.poistaPaatos')}
            handleConfirm={() => confirmDelete(paatosTieto.id)}
            handleClose={closeModal}
            t={t}
          />
          <Stack
            key={`stack-${index}`}
            direction={'row'}
            gap={theme.spacing(2)}
            sx={{ justifyContent: 'space-between', alignItems: 'center' }}
          >
            <OphTypography variant={'h3'}>
              {t('hakemus.paatos.paatostyyppi.paatos')} {index + 1}
            </OphTypography>
            {index > 0 && (
              <OphButton
                sx={{
                  alignSelf: 'flex-end',
                }}
                data-testid={`poista-paatos-button`}
                variant="text"
                startIcon={<DeleteOutline />}
                onClick={() => setDeleteModalOpen(true)}
              >
                {t('hakemus.paatos.paatostyyppi.poistaPaatos')}
              </OphButton>
            )}
          </Stack>
          <PaatosTietoComponent
            key={index}
            t={t}
            paatosTieto={paatosTieto}
            updatePaatosTietoAction={(updated) =>
              updatePaatosTietoAction(updated, index)
            }
            tutkinnot={tutkinnot}
          />
          <Divider />
        </Stack>
      ))}
    </>
  );
};
