import { Info } from '@mui/icons-material';
import { Paper } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';
import React from 'react';

export const InFoTeksti = ({ infoTeksti }: { infoTeksti: string }) => {
  return (
    <Paper
      square
      variant={'outlined'}
      sx={{
        padding: 2,
        display: 'flex',
        gap: 1,
        flexDirection: 'row',
        backgroundColor: `${ophColors.blue2}0A`,
        borderColor: `${ophColors.blue2}0A`,
      }}
    >
      <Info sx={{ color: ophColors.blue2 }} />
      <OphTypography>{infoTeksti}</OphTypography>
    </Paper>
  );
};
