import { FormatColorText } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Stack } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import { useRef, useState } from 'react';

import { useCloseOnClickOutside } from '@/src/hooks/useCloseOnClickOutside';

export const fontColors = [
  ophColors.orange3,
  ophColors.green2,
  ophColors.purple3,
  ophColors.grey900,
];

export type FontColor = (typeof fontColors)[number];

const iconStyle = {
  color: ophColors.grey700,
};

const colorButtonStyle = (color: FontColor, selected: boolean) => ({
  width: '24px',
  height: '24px',
  backgroundColor: color,
  sizing: 'box-sizing',
  border: selected ? '1px solid white' : 'none',
  boxShadow: selected ? '0 0 4px 2px rgba(0,0,0,0.27)' : 'none',
  '&:hover': {
    backgroundColor: color,
  },
});

export function ColorPicker({
  changeFontColor,
  selectedColor,
}: {
  changeFontColor: (color: FontColor) => void;
  selectedColor: FontColor;
}) {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLElement>(undefined);
  useCloseOnClickOutside(ref, () => setOpen(false));

  return (
    <Box sx={{ position: 'relative' }}>
      <OphButton
        onClick={() => {
          setOpen(!open);
        }}
        aria-label="Format color"
        sx={{
          borderRadius: '4px',
          '&:hover': {
            backgroundOpacity: 1,
            backgroundColor: ophColors.grey100,
          },
          height: '34px',
        }}
        startIcon={<FormatColorText style={iconStyle} />}
        endIcon={<ExpandMoreIcon style={iconStyle} />}
      />
      {open && (
        <Box
          ref={ref}
          sx={{
            position: 'absolute',
            top: '36px',
            padding: '15px',
            backgroundColor: ophColors.white,
            boxShadow: '0 2px 5px 0 rgba(0,0,0,0.25)',
          }}
        >
          <Stack direction={'row'} gap={'15px'}>
            {fontColors.map((fontColor) => (
              <OphButton
                key={fontColor}
                sx={colorButtonStyle(fontColor, fontColor === selectedColor)}
                onClick={() => {
                  setOpen(false);
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
