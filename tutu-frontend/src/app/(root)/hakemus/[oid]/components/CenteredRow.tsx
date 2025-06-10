import React from 'react';
import { Stack } from '@mui/material';

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
