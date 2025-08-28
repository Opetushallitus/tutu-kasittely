import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { Stack, styled } from '@mui/material';
import { TFunction } from '@/src/lib/localization/hooks/useTranslations';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@/src/components/IconButton';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  minWidth: 800,
  bgcolor: ophColors.white,
  border: `00px solid ${ophColors.white}`,
  boxShadow: 24,
  p: 4,
};

const StyledIconButton = styled(IconButton)(() => ({
  position: 'absolute',
  right: '12px',
  top: '20px',
}));

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
    <Modal open={open} onClose={handleClose} data-testid="modal-component">
      <Box sx={style}>
        <StyledIconButton aria-label="close" onClick={handleClose}>
          <CloseIcon />
        </StyledIconButton>
        <Stack direction="column" gap={2}>
          <OphTypography variant="h2">{header}</OphTypography>
          <OphTypography variant={'body1'}>{content}</OphTypography>
          <Stack direction="row" gap={2} justifyContent="flex-end">
            <OphButton
              data-testid="modal-peruuta-button"
              variant="outlined"
              onClick={handleClose}
            >
              {t('yleiset.peruuta')}
            </OphButton>
            <OphButton
              data-testid="modal-confirm-button"
              variant="contained"
              onClick={handleConfirm}
            >
              {t('hakemus.tutkinnot.poistaTutkinto')}
            </OphButton>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};
