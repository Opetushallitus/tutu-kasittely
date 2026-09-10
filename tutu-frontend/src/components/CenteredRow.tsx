import { Stack } from '@mui/material';
import React from 'react';

export type CenteredRowProps = {
  gap: number;
  children: React.ReactNode;
};

export const CenteredRow = (props: CenteredRowProps) => {
  const { gap, children } = props;
  return (
    <Stack direction="row" spacing={gap} alignItems="center">
      {children}
    </Stack>
  );
};
