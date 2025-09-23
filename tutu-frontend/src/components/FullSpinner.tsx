import { Box, CircularProgress } from '@mui/material';

export const FullSpinner = ({
  ariaLabel,
  float = false,
}: {
  ariaLabel?: string;
  float?: boolean;
}) => (
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
    <CircularProgress aria-label={ariaLabel} />
  </Box>
);
