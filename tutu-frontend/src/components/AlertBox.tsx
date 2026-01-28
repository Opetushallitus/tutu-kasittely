import { ReportProblem } from '@mui/icons-material';
import { Box, Stack, styled } from '@mui/material';
import { ophColors, OphTypography } from '@opetushallitus/oph-design-system';

const InfoIconBlue = styled(ReportProblem)({
  color: ophColors.yellow1,
  paddingTop: '3px',
});

const StyledBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  padding: theme.spacing(3, 2),
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: 'transparent',
  zIndex: 1, // Add z-index to make sure the box is above BoxWrapper
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: ophColors.yellow3,
    opacity: 0.1,
    zIndex: 0, // Changed from -1 to 0 to be between the content and BoxWrapper
  },
}));

export const AlertBox = ({
  infoText,
  headingText,
}: {
  infoText: string;
  headingText: string;
}) => {
  return (
    <StyledBox data-testid="alert-box">
      <Stack gap={2} sx={{ width: '100%' }}>
        <OphTypography variant={'h3'}>{headingText}</OphTypography>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <InfoIconBlue />
          <OphTypography variant={'body1'}>{infoText}</OphTypography>
        </Box>
      </Stack>
    </StyledBox>
  );
};
