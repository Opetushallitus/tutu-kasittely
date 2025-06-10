import { Stack, styled } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';

export const PaatosTaydennyspyyntoStack = styled(Stack)(({ theme }) => ({
  backgroundColor: ophColors.grey100,
  padding: theme.spacing(1, 1),
}));
