import Box from '@mui/material/Box';
import { Stack } from '@mui/material';
import { OphButton, OphTypography } from '@opetushallitus/oph-design-system';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { FullSpinner } from '@/src/components/FullSpinner';

interface PreviewComponentProps {
  setShowPreview: (showPreview: boolean) => void;
  headerText: string;
  closeButtonText: string;
  content: React.ReactNode;
  isLoading: boolean;
  showCopyButton?: boolean;
}
export const PreviewComponent = ({
  setShowPreview,
  headerText,
  closeButtonText,
  content,
  isLoading,
  showCopyButton = false,
}: PreviewComponentProps) => {
  const { t } = useTranslations();
  if (isLoading) return <FullSpinner></FullSpinner>;

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
          {/*TODO: lisätään kopiointinappi ja logiikka*/}
          {showCopyButton && null}
          <OphButton
            data-testid="close-preview-button"
            onClick={() => setShowPreview(false)}
            startIcon={<CloseIcon />}
          >
            {t(closeButtonText)}
          </OphButton>
        </Stack>
        {content}
      </Stack>
    </Box>
  );
};
