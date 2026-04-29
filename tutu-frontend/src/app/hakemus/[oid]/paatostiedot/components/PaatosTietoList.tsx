'use client';

import { DeleteOutline, ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { Divider, Stack, useTheme } from '@mui/material';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { PaatosTietoComponent } from '@/src/app/hakemus/[oid]/paatostiedot/components/PaatosTietoComponent';
import { useGlobalConfirmationModal } from '@/src/components/ConfirmationModal';
import { IconButton } from '@/src/components/IconButton';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import { PaatosTieto, PaatosTietoOptionGroup } from '@/src/lib/types/paatos';
import { Tutkinto } from '@/src/lib/types/tutkinto';

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
  reorderPaatosTieto: (
    fromIndex: number,
    toIndex: number,
    immediateSave?: boolean,
  ) => void;
  tutkinnot: Tutkinto[];
}

export const PaatosTietoList = ({
  t,
  paatosTiedot,
  paatosTietoOptions,
  updatePaatosTietoAction,
  deletePaatosTieto,
  reorderPaatosTieto,
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
        <Stack direction={'row'} sx={{ alignItems: 'center' }}>
          <Stack direction={'column'}>
            <IconButton
              data-testid={`nosta-paatos`}
              aria-label={t('hakemus.paatos.jarjestys.ylos')}
              disabled={index === 0}
              onClick={() => reorderPaatosTieto(index, index - 1)}
            >
              <ArrowDropUp
                sx={{
                  color: index === 0 ? ophColors.grey400 : ophColors.grey900,
                }}
              />
            </IconButton>
            <IconButton
              data-testid={`laske-paatos`}
              aria-label={t('hakemus.paatos.jarjestys.alas')}
              disabled={index >= paatosTiedot.length - 1}
              onClick={() => reorderPaatosTieto(index, index + 1)}
            >
              <ArrowDropDown
                sx={{
                  color:
                    index >= paatosTiedot.length - 1
                      ? ophColors.grey400
                      : ophColors.grey900,
                }}
              />
            </IconButton>
          </Stack>
          <OphTypography variant={'h3'}>
            {t('hakemus.paatos.paatostyyppi.paatos')} {index + 1}
          </OphTypography>
        </Stack>
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
