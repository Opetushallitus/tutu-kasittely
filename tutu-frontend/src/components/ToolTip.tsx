import { styled } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

export const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip
    {...props}
    classes={{ popper: className }}
    placement="right-start"
    arrow
  />
))(() => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: ophColors.white,
    color: ophColors.black,
    minWidth: 500,
    padding: '16px',
    boxShadow: `0px 4px 12px ${ophColors.grey300}`,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: ophColors.white,
    filter: `drop-shadow(0px 4px 4px ${ophColors.grey300}`,
  },
}));
