'use client';

import { Box, CircularProgress } from '@mui/material';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export const FullSpinner = ({
  ariaLabel,
  float = false,
}: {
  ariaLabel?: string;
  float?: boolean;
}) => {
  const { t } = useTranslations();
  const label = ariaLabel || t('yleinen.ladataan');

  return (
    <Box
      sx={{
        position: float ? 'fixed' : 'relative',
        zIndex: 9999,
        left: '0',
        top: '0',
        minHeight: '150px',
        maxHeight: '80vh',
        width: '100%',
        height: float ? '100%' : 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress aria-label={label} />
    </Box>
  );
};
