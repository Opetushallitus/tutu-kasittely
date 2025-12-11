'use client';

import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { PaatosTieto, PaatosTietoOptionGroup } from '@/src/lib/types/paatos';
import { Divider, Stack, useTheme } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import { DeleteOutline } from '@mui/icons-material';
import { PaatosTietoComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosTietoComponent';
import React from 'react';
import { Tutkinto } from '@/src/lib/types/tutkinto';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';

interface PaatosTietoListProps {
  t: TFunction;
  paatosTiedot: PaatosTieto[];
  paatosTietoOptions: PaatosTietoOptionGroup;
  updatePaatosTietoAction: (
    updatedPaatosTieto: PaatosTieto,
    index: number,
    immediateSave?: boolean,
  ) => void;
  deletePaatosTieto: (id: string | undefined) => void;
  tutkinnot: Tutkinto[];
}

export const PaatosTietoList = ({
  t,
  paatosTiedot,
  paatosTietoOptions,
  updatePaatosTietoAction,
  deletePaatosTieto,
  tutkinnot,
}: PaatosTietoListProps) => {
  const theme = useTheme();
  const { showConfirmation } = useGlobalConfirmationModal();

  return paatosTiedot.map((paatosTieto, index) => (
    <Stack key={index} direction={'column'} gap={theme.spacing(2)}>
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
            onClick={() =>
              showConfirmation({
                header: t('hakemus.paatos.modal.otsikko'),
                content: t('hakemus.paatos.modal.teksti'),
                confirmButtonText: t('hakemus.paatos.modal.poistaPaatos'),
                handleConfirmAction: () => deletePaatosTieto(paatosTieto.id),
              })
            }
          >
            {t('hakemus.paatos.paatostyyppi.poistaPaatos')}
          </OphButton>
        )}
      </Stack>
      <PaatosTietoComponent
        key={index}
        t={t}
        paatosTieto={paatosTieto}
        paatosTietoOptions={paatosTietoOptions}
        updatePaatosTietoAction={(updated, immediateSave?: boolean) =>
          updatePaatosTietoAction(updated, index, immediateSave)
        }
        tutkinnot={tutkinnot}
      />
      <Divider />
    </Stack>
  ));
};
