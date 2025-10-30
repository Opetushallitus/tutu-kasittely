'use client';

import { OphButton } from '@opetushallitus/oph-design-system';
import { Box } from '@mui/material';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

interface SaveRibbonProps {
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
}

export const SaveRibbon = ({
  onSave,
  isSaving,
  hasChanges,
}: SaveRibbonProps) => {
  const { t } = useTranslations();

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
      <OphButton
        variant="contained"
        onClick={onSave}
        disabled={isSaving}
        sx={{ minWidth: 200 }}
        data-testid="save-ribbon-button"
      >
        {isSaving ? t('yleiset.tallennetaan') : t('yleiset.tallenna')}
      </OphButton>
    </Box>
  );
};
