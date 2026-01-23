import InfoIcon from '@mui/icons-material/Info';
import { Box, styled } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';

const InfoIconBlue = styled(InfoIcon)({
  color: ophColors.blue2,
  paddingTop: '3px',
});

const StyledBox = styled(Box)(({ theme }) => ({
  backgroundColor: ophColors.grey50,
  padding: theme.spacing(1, 2),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

export const InfoBox = ({ infoText }: { infoText: string }) => {
  return (
    <StyledBox>
      <InfoIconBlue />
      {infoText}
    </StyledBox>
  );
};
