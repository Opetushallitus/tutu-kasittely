import { styled } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import Link from 'next/link';

export const StyledLink = styled(Link)({
  color: ophColors.blue2,
  fontWeight: 600,
  textDecoration: 'none',
});
