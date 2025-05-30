'use client';

import { ophColors } from '@opetushallitus/oph-design-system';
import { styled as muiStyled, Theme, ThemeOptions } from '@mui/material/styles';
import { shouldForwardProp } from '@mui/system/createStyled';

export { ophColors } from '@opetushallitus/oph-design-system';

const withTransientProps = (propName: string) =>
  // Emotion doesn't support transient props by default so add support manually
  shouldForwardProp(propName) && !propName.startsWith('$');

export const styled: typeof muiStyled = (
  tag: Parameters<typeof muiStyled>[0],
  options: Parameters<typeof muiStyled>[1] = {},
) => {
  return muiStyled(tag, {
    shouldForwardProp: (propName: string) =>
      (!options.shouldForwardProp || options.shouldForwardProp(propName)) &&
      withTransientProps(propName),
    ...options,
  });
};

export const DEFAULT_BOX_BORDER = `1px solid ${ophColors.grey200}`;

export const MAX_WIDTH = '1920px';

export const notLarge = (theme: Theme) => theme.breakpoints.down('lg');

export const THEME_OVERRIDES: ThemeOptions = {
  components: {
    MuiCircularProgress: {
      defaultProps: {
        size: 50,
        thickness: 4.5,
      },
    },
    MuiStack: {
      defaultProps: {
        useFlexGap: true,
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(2),
        }),
      },
    },
    MuiButton: {
      defaultProps: {
        loadingPosition: 'start',
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.MuiTableCell-head': {
            ...theme.typography.label,
          },
          '&.MuiTableCell-body': {
            ...theme.typography.body1,
          },
        }),
      },
    },
  },
};
