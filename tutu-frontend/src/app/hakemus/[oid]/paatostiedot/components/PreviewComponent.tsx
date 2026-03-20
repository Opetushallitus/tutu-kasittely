import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CloseIcon from '@mui/icons-material/Close';
import { Stack, styled } from '@mui/material';
import Box from '@mui/material/Box';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import React from 'react';

import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';

interface PreviewComponentProps {
  setShowPreview: (showPreview: boolean) => void;
  headerText: string;
  closeButtonText: string;
  content: React.ReactNode;
  showCopyButton?: boolean;
  hakemusOid: string;
}

export const PreviewContent = styled(Box)({
  whiteSpace: 'pre-line',
  overflowY: 'auto',
});

export const PreviewComponent = ({
  setShowPreview,
  headerText,
  closeButtonText,
  content,
  hakemusOid,
}: PreviewComponentProps) => {
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
      data-testid="preview-content"
    >
      <Stack sx={{ height: '100%' }} direction="column" gap={2}>
        <Stack
          direction="row"
          gap={2}
          justifyContent="space-between"
          alignItems="center"
        >
          <OphTypography variant="h2">{t(headerText)}</OphTypography>
          <Stack direction={'row'}>
            <OphButton
              variant={'contained'}
              href={`/hakemus/${hakemusOid}/editori/paatos`}
              startIcon={<CheckCircleOutlineRoundedIcon />}
            >
              {t('hakemus.paatos')}
            </OphButton>
            <OphButton
              data-testid="close-preview-button"
              onClick={() => setShowPreview(false)}
              startIcon={<CloseIcon />}
            >
              {t(closeButtonText)}
            </OphButton>
          </Stack>
        </Stack>
        {content}
      </Stack>
    </Box>
  );
};
