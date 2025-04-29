'use client';

import { DEFAULT_BOX_BORDER, styled } from '@/lib/theme';
import { Box } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';

export const BoxWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: ophColors.white,
  width: '100%',
  padding: theme.spacing(2, 3),
  border: DEFAULT_BOX_BORDER,
}));
