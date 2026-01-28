'use client';
import CloseIcon from '@mui/icons-material/Close';
import { Stack, styled } from '@mui/material';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import * as React from 'react';

import { IconButton } from '@/src/components/IconButton';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

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

export type ConfirmationModalProps = {
  open: boolean;
  header: string;
  content: string;
  confirmButtonText: string;
  handleConfirmAction: () => void;
  handleCloseAction?: () => void;
};

type ConfirmationModalContextValue = {
  showConfirmation: (props: Omit<ConfirmationModalProps, 'open'>) => void;
  hideConfirmation: () => void;
};

export const ConfirmationModalContext =
  React.createContext<ConfirmationModalContextValue | null>(null);

export const ConfirmationModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [modalProps, setModalProps] =
    React.useState<ConfirmationModalProps | null>(null);

  const contextValue: ConfirmationModalContextValue = React.useMemo(
    () => ({
      showConfirmation: (props) =>
        setModalProps({
          ...props,
          handleConfirmAction: () => {
            props.handleConfirmAction();
            setModalProps(null);
          },
          handleCloseAction: () => {
            props.handleCloseAction?.();
            setModalProps(null);
          },
          open: true,
        }),
      hideConfirmation: () => setModalProps(null),
    }),
    [setModalProps],
  );

  return (
    <ConfirmationModalContext value={contextValue}>
      {modalProps && <ConfirmationModal {...modalProps} />}
      {children}
    </ConfirmationModalContext>
  );
};
export const ConfirmationModal = ({
  open,
  header,
  content,
  confirmButtonText,
  handleConfirmAction,
  handleCloseAction,
}: ConfirmationModalProps) => {
  const { t } = useTranslations();
  return (
    <Modal
      open={open}
      onClose={handleCloseAction}
      data-testid="modal-component"
    >
      <Box sx={style}>
        <StyledIconButton aria-label="close" onClick={handleCloseAction}>
          <CloseIcon />
        </StyledIconButton>
        <Stack direction="column" gap={2}>
          <OphTypography variant="h2">{header}</OphTypography>
          <OphTypography variant={'body1'}>{content}</OphTypography>
          <Stack direction="row" gap={2} justifyContent="flex-end">
            <OphButton
              data-testid="modal-peruuta-button"
              variant="outlined"
              onClick={handleCloseAction}
            >
              {t('yleiset.peruuta')}
            </OphButton>
            <OphButton
              data-testid="modal-confirm-button"
              variant="contained"
              onClick={handleConfirmAction}
            >
              {confirmButtonText}
            </OphButton>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
};

export const useGlobalConfirmationModal = () => {
  const context = React.use(ConfirmationModalContext);
  if (!context) {
    throw new Error(
      'useGlobalConfirmationModal must be used within a ConfirmationModalProvider',
    );
  }
  return context;
};
