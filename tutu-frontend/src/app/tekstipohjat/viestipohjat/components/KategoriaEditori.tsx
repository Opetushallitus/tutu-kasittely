'use client';

import { Stack } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import {
  OphButton,
  ophColors,
  OphInputFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React, { useState } from 'react';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { ViestipohjaKategoria } from '@/src/lib/types/viesti';

export const KategoriaEditori = ({
  handleClose,
  kategoria,
  handleSubmit,
}: {
  handleClose: () => void;
  kategoria?: ViestipohjaKategoria;
  handleSubmit: (kategoria: ViestipohjaKategoria) => void;
}) => {
  const { t } = useTranslations();

  const [nimi, setNimi] = useState(kategoria?.nimi ?? '');

  return (
    <Modal
      open={true}
      onClose={handleClose}
      role={'dialog'}
      aria-labelledby="kategoria-editor-header"
      data-testid="modal-component"
      sx={{
        zIndex: 100, // SaveRibbon + 1
      }}
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.8)' } },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          minWidth: 800,
          bgcolor: ophColors.white,
          boxShadow: 24,
          p: 3,
        }}
      >
        <Stack direction="column" gap={6}>
          <OphTypography variant="h1" id={'kategoria-editor-header'}>
            {kategoria
              ? t('tekstipohjat.kategoriat.muokkaa')
              : t('tekstipohjat.kategoriat.lisaa')}
          </OphTypography>
          <OphInputFormField
            label={t('tekstipohjat.kategoriat.nimi')}
            value={nimi}
            onChange={(event) => setNimi(event.target.value)}
          ></OphInputFormField>
          <Stack direction="row" gap={2} justifyContent="flex-end">
            <OphButton
              data-testid="modal-peruuta-button"
              variant={'outlined'}
              onClick={handleClose}
            >
              {t('yleiset.peruuta')}
            </OphButton>
            <OphButton
              data-testid="modal-confirm-button"
              variant={'contained'}
              onClick={() => {
                handleSubmit({ ...kategoria, nimi });
              }}
            >
              {t('yleiset.tallenna')}
            </OphButton>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};
