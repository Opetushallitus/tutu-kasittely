'use client';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Stack, useTheme } from '@mui/material';
import {
  OphButton,
  OphTypography,
  ophColors,
} from '@opetushallitus/oph-design-system';
import React, { useEffect, useRef } from 'react';

import { DATE_TIME_PLACEHOLDER } from '@/src/constants/constants';
import { formatHelsinki } from '@/src/lib/dateUtils';
import { useTranslations } from '@/src/lib/localization/hooks/useTranslations';
import { styled } from '@/src/lib/theme';

interface SaveRibbonProps {
  onSave: () => void;
  isSaving: boolean;
  hasChanges: boolean;
  lastSaved?: string;
  modifier?: string;
}

export const SaveRibbon = ({
  onSave,
  isSaving,
  hasChanges,
  lastSaved,
  modifier,
}: SaveRibbonProps) => {
  const { t } = useTranslations();
  const ribbonRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();

  const StyledInfoOutlinedIcon = styled(InfoOutlinedIcon)({
    color: ophColors.black,
  });

  // Lisää paddingia ettei sisältö jää ribbonin alle.
  useEffect(() => {
    if (!ribbonRef.current) return;

    const el = ribbonRef.current as HTMLDivElement;
    const prev = document.body.style.paddingBottom;

    const apply = () => {
      const height = el.offsetHeight;
      document.body.style.paddingBottom = `${height}px`;
    };

    if (hasChanges) {
      apply();
      window.addEventListener('resize', apply);
    }

    return () => {
      document.body.style.paddingBottom = prev || '';
      window.removeEventListener('resize', apply);
    };
  }, [hasChanges]);

  if (!hasChanges) return null;

  return (
    <Box
      ref={ribbonRef}
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
        zIndex: 99999,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          minHeight: 56,
        }}
      >
        {Boolean(lastSaved || modifier) && (
          <Stack
            data-testid="save-ribbon-last-saved"
            direction="row"
            alignItems="flex-start"
            gap={theme.spacing(0.5)}
            sx={{
              // Aloita 25%, piilota kun leveys <= 1000px;
              ml: 'max(0px, min(25%, calc(50% - 500px)))',
              '@media (max-width:1000px)': {
                display: 'none',
              },
            }}
          >
            <StyledInfoOutlinedIcon />
            <Box>
              <OphTypography variant="body1">
                {t('hakemus.perustiedot.muutoshistoria.muokattuViimeksi')}
              </OphTypography>
              <OphTypography variant="body1">
                {lastSaved
                  ? formatHelsinki(lastSaved, DATE_TIME_PLACEHOLDER)
                  : ''}
                {'  '}
                {modifier ? modifier : ' '}
              </OphTypography>
            </Box>
          </Stack>
        )}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
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
      </Box>
    </Box>
  );
};
