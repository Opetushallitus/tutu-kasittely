import Box from '@mui/material/Box';
import { Stack } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import { useShowPaatosTekstiPreview } from '@/src/context/ShowPaatosTekstiPreviewContext';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

export const PaatosTekstiPreview = () => {
  const { setShowPaatosTekstiPreview } = useShowPaatosTekstiPreview();
  const { t } = useTranslations();

  return (
    <Box
      sx={{
        width: '50%',
        backgroundColor: 'white',
        borderLeft: '1px solid',
        borderColor: 'divider',
        paddingLeft: 2,
      }}
      data-testid="paatosteksti-preview-content"
    >
      <Stack sx={{ height: '100%' }} direction="column" gap={2}>
        <Stack
          direction="row"
          gap={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <OphTypography variant="h2">
            {t('hakemus.paatos.paatosteksti')}
          </OphTypography>
          <OphButton
            data-testid="paatos-esikatselu-sulje-button"
            onClick={() => setShowPaatosTekstiPreview(false)}
            startIcon={<CloseIcon />}
          >
            {t('hakemus.paatos.suljeEsikatselu')}
          </OphButton>
        </Stack>
      </Stack>
    </Box>
  );
};
