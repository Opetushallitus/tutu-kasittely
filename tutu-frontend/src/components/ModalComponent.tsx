import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { Stack } from '@mui/material';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: 800,
  bgcolor: ophColors.white,
  border: '00px solid #FFF',
  boxShadow: 24,
  p: 4,
};

export type ModalComponentProps = {
  open: boolean;
  header: string;
  content: string;
  handleConfirm: () => void;
  handleClose: () => void;
  t: TFunction;
};
export const ModalComponent = ({
  open,
  header,
  content,
  handleConfirm,
  handleClose,
  t,
}: ModalComponentProps) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Stack direction="column" gap={2}>
          <OphTypography variant="h2">{header}</OphTypography>
          <OphTypography variant={'body1'}>{content}</OphTypography>
          <Stack direction="row" gap={2} justifyContent="flex-end">
            <OphButton
              data-testid="pyyda-asiakirja-button"
              variant="outlined"
              // sx={{ width: '15%' }}
              onClick={() => handleClose()}
            >
              {t('yleiset.peruuta')}
            </OphButton>
            <OphButton
              data-testid="pyyda-asiakirja-button"
              variant="outlined"
              // sx={{ width: '15%' }}
              onClick={() => handleConfirm()}
            >
              {t('hakemus.tutkinnot.poistaTutkinto')}
            </OphButton>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};
