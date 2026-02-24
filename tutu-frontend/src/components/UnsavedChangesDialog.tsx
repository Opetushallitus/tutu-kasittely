'use client';

import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import {
  OphButton,
  ophColors,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { useTranslations } from '../lib/localization/hooks/useTranslations';

interface UnsavedChangesDialogProps {
  active: boolean;
  accept: () => void;
  reject: () => void;
}

export const UnsavedChangesDialog = ({
  active,
  accept,
  reject,
}: UnsavedChangesDialogProps) => {
  const { t } = useTranslations();
  return (
    <Dialog
      open={active}
      onClose={reject}
      aria-labelledby="unsaved-dialog-otsikko"
      data-testid="unsaved-dialog"
      sx={{
        zIndex: 100000, // SaveRibbon + 1
      }}
      slotProps={{
        backdrop: { sx: { backgroundColor: 'rgba(0,0,0,0.8)' } },
      }}
    >
      <DialogTitle id="unsaved-dialog-otsikko">
        <OphTypography
          variant="body1"
          sx={{ fontWeight: 600, fontSize: '34px', marginTop: 2 }}
        >
          {t('yleiset.tallentamattomiaMuutoksia')}
        </OphTypography>
      </DialogTitle>
      <IconButton
        aria-label="close"
        onClick={reject}
        sx={{
          position: 'absolute',
          right: 4,
          top: 4,
        }}
      >
        <CloseIcon sx={{ color: ophColors.black }} fontSize="small" />
      </IconButton>
      <DialogContent>
        <OphTypography variant="body1">
          {t('yleiset.lomakkeellaOnMuutoksia')}
        </OphTypography>
      </DialogContent>
      <DialogActions sx={{ paddingRight: 3, paddingBottom: 2 }}>
        <OphButton
          variant="outlined"
          onClick={reject}
          data-testid="unsaved-dialog-cancel-button"
        >
          {t('yleiset.peruuta')}
        </OphButton>
        <OphButton
          variant="contained"
          onClick={accept}
          data-testid="unsaved-dialog-continue-button"
        >
          {t('yleiset.jatkaTallentamatta')}
        </OphButton>
      </DialogActions>
    </Dialog>
  );
};
