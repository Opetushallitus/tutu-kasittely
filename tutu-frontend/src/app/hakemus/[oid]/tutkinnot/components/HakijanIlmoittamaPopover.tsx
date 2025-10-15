'use client';

import { Popover, IconButton, Box } from '@mui/material';
import { OphTypography } from '@opetushallitus/oph-design-system';
import { Close } from '@mui/icons-material';
import React from 'react';

export type HakijanIlmoittamaPopoverProps = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  sisalto: string | undefined;
};

export const HakijanIlmoittamaPopover = ({
  anchorEl,
  onClose,
  sisalto,
}: HakijanIlmoittamaPopoverProps) => {
  const open = Boolean(anchorEl);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            padding: 2,
            width: 312,
            minHeight: 24,
            overflow: 'visible',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 8,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        },
      }}
      sx={{
        '& .MuiPopover-paper': {
          marginTop: '8px',
        },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: -8,
            top: -8,
          }}
        >
          <Close fontSize="small" />
        </IconButton>
        <OphTypography
          variant="body1"
          sx={{
            fontWeight: 400,
            paddingRight: 3,
            minHeight: '24px',
          }}
        >
          {sisalto}
        </OphTypography>
      </Box>
    </Popover>
  );
};
