import { styled } from '@mui/material';
import Link from 'next/link';
import { ophColors } from '@opetushallitus/oph-design-system';

export const StyledLink = styled(Link)({
  color: ophColors.blue2,
  fontWeight: 600,
  textDecoration: 'none',
});
