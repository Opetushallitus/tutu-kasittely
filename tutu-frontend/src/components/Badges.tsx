import { Chip, styled } from '@mui/material';

import { ophColors } from '@/src/lib/theme';

const baseBadgeStyles = {
  borderRadius: '2px',
  height: '1.5rem',
  '& .MuiChip-label': {
    fontSize: '0.875rem',
    fontWeight: 600,
    padding: '2px 5px',
  },
};

export const ApHakemusBadge = styled(Chip)(() => ({
  ...baseBadgeStyles,
  color: ophColors.cyan1,
  backgroundColor: ophColors.lightBlue2,
}));

export const UusiBadge = styled(Chip)(() => ({
  ...baseBadgeStyles,
  color: ophColors.green1,
  backgroundColor: ophColors.green5,
  '& .MuiChip-label': {
    fontSize: '13px',
    lineHeight: '15px',
    fontWeight: 600,
    padding: '4px 8px',
  },
}));

export const PeruutettuBadge = styled(Chip)(() => ({
  ...baseBadgeStyles,
  color: ophColors.grey900,
  backgroundColor: '#EECFC5',
}));

export const MyonteinenBadge = styled(Chip)(() => ({
  ...baseBadgeStyles,
  color: ophColors.green1,
  backgroundColor: '#E2FAE4',
}));

export const KielteinenBadge = styled(Chip)(() => ({
  ...baseBadgeStyles,
  color: ophColors.grey900,
  backgroundColor: '#EECFC5',
}));
