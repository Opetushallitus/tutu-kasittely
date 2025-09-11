import { Box, styled } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { CheckCircle } from '@mui/icons-material';

const InfoIconBlue = styled(CheckCircle)({
  color: ophColors.green2,
  paddingTop: '3px',
});

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#F4FFF4', // TODO ophColors.green6 when it exits,
  padding: theme.spacing(3, 2),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const SuccessBox = ({ infoText }: { infoText: string }) => {
  return (
    <StyledBox data-testid="success-box">
      <InfoIconBlue />
      {infoText}
    </StyledBox>
  );
};
