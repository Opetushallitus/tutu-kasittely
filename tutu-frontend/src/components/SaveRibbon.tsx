'use client';

import { Box, Grid2, IconButton } from '@mui/material';
import { DATE_TIME_PLACEHOLDER } from '@/src/constants/constants';
import { styled } from '@/src/lib/theme';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  OphButton,
  OphTypography,
  ophColors,
} from '@opetushallitus/oph-design-system';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import * as dateFns from 'date-fns';

interface SaveRibbonProps {
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  lastSaved?: string;
  modifierFirstName?: string;
  modifierLastName?: string;
}

export const SaveRibbon = ({
  onSave,
  isSaving,
  hasChanges,
  lastSaved,
  modifierFirstName,
  modifierLastName,
}: SaveRibbonProps) => {
  const { t } = useTranslations();

  const StyledInfoOutlinedIcon = styled(InfoOutlinedIcon)({
    color: ophColors.blue2,
  });

  if (!hasChanges) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        borderTop: '1px solid',
        borderColor: 'divider',
        padding: 2,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <Grid2 container wrap="nowrap">
        <Grid2 size={1} direction="column">
          <IconButton>
            <StyledInfoOutlinedIcon />
          </IconButton>
        </Grid2>
        <Grid2 size={8}>
          <OphTypography variant="body1">
            {t('hakemus.perustiedot.muutoshistoria.muokattuViimeksi')}
          </OphTypography>
          <OphTypography variant="body1">
            {lastSaved
              ? dateFns.format(Date.parse(lastSaved), DATE_TIME_PLACEHOLDER)
              : ''}
            {'  '}
            {modifierFirstName ? modifierFirstName : ''}{' '}
            {modifierLastName ? modifierLastName : ''}
          </OphTypography>
        </Grid2>
        <Grid2 size={4}>
          <OphButton
            variant="contained"
            onClick={onSave}
            disabled={isSaving}
            sx={{ minWidth: 200 }}
            data-testid="save-ribbon-button"
          >
            {isSaving ? t('yleiset.tallennetaan') : t('yleiset.tallenna')}
          </OphButton>
        </Grid2>
      </Grid2>
    </Box>
  );
};
