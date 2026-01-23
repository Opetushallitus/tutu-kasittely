import { Stack } from '@mui/material';
import React from 'react';

export type CenteredRowProps = {
  gap: string;
  children: React.ReactNode;
};

export const CenteredRow = (props: CenteredRowProps) => {
  const { gap, children } = props;
  return (
    <Stack direction="row" gap={gap} alignItems="center">
      {children}
    </Stack>
  );
};
