import { styled } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import React from 'react';

type StyledIconButtonProps = React.ComponentProps<'button'> & {
  children: React.ReactNode;
};

const StyledIconButton = styled('button')(() => ({
  border: 'none',
  backgroundColor: ophColors.white,
  '&:hover': {
    backgroundColor: ophColors.white,
    cursor: 'pointer',
  },
}));

export const IconButton = ({ children, ...rest }: StyledIconButtonProps) => {
  return <StyledIconButton {...rest}>{children}</StyledIconButton>;
};
