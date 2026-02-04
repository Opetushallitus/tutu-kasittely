import { FormatColorText, KeyboardArrowDown } from '@mui/icons-material';
import { Box, Stack } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useState } from 'react';

export const fontColors = [
  ophColors.black,
  ophColors.blue3,
  ophColors.alias.error,
  ophColors.green3,
];

export type FontColor = (typeof fontColors)[number];

export function ColorPicker({
  changeFontColor,
}: {
  changeFontColor: (color: FontColor) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ position: 'relative' }}>
      <OphButton
        onClick={() => {
          setOpen(!open);
        }}
        aria-label="Format color"
        startIcon={<FormatColorText style={{ color: ophColors.black }} />}
        endIcon={
          <KeyboardArrowDown
            style={{ color: ophColors.black, marginLeft: 0 }}
          />
        }
      />
      {open && (
        <Box
          sx={{
            position: 'absolute',
            top: '36px',
            padding: '8px',
            backgroundColor: ophColors.white,
            border: '1px solid #000000',
          }}
        >
          <Stack direction={'row'} gap={1}>
            {fontColors.map((fontColor) => (
              <OphButton
                key={fontColor}
                sx={{
                  width: '24px',
                  height: '24px',
                  backgroundColor: fontColor,
                }}
                onClick={() => {
                  changeFontColor(fontColor);
                }}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
