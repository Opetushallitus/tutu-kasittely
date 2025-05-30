'use client';

import { Box, Stack, useTheme } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { DEFAULT_BOX_BORDER, MAX_WIDTH, styled } from '@/src/lib/theme';
import { ReactNode } from 'react';

const HeaderWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: ophColors.white,
  width: '100%',
  borderBottom: DEFAULT_BOX_BORDER,
  padding: theme.spacing(2, 0),
}));

export const PageContent = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: MAX_WIDTH,
  margin: 'auto',
  boxSizing: 'border-box',
  padding: theme.spacing(0, 3),
}));

export const PageLayout = ({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) => {
  const theme = useTheme();
  return (
    <Stack
      sx={{
        width: '100%',
        alignItems: 'stretch',
      }}
      gap={theme.spacing(2)}
    >
      <HeaderWrapper>
        <PageContent>{header}</PageContent>
      </HeaderWrapper>
      <PageContent>{children}</PageContent>
    </Stack>
  );
};
