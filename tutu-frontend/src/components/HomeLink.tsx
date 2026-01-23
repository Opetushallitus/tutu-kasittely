'use client';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { styled } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import Link from 'next/link';

const StyledHomeIcon = styled(HomeOutlinedIcon)({
  color: ophColors.blue2,
  justifyContent: 'center',
  alignItems: 'center',
  display: 'flex',
  paddingBottom: '2px',
});

const StyledLink = styled(Link)({
  color: ophColors.blue2,
  border: '2px solid',
  borderRadius: '5px',
  padding: '8px',
  height: '40px',
  width: '40px',
  display: 'flex',
  justifyContent: 'center',
});

export const HomeIcon = ({ href }: { href: string }) => {
  return (
    <StyledLink href={href}>
      <StyledHomeIcon />
    </StyledLink>
  );
};

export const HomeStyledChevron = styled(ChevronRightIcon)({
  color: ophColors.grey400,
});
