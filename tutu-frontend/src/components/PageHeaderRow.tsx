import { Stack, useTheme } from '@mui/material';
import { ReactNode } from 'react';

export const PageHeaderRow = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      spacing={theme.spacing(0, 1)}
      sx={{ alignItems: 'center' }}
    >
      {children}
    </Stack>
  );
};
