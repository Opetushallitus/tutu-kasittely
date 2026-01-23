'use client';

import { Stack, Box } from '@mui/material';
import {
  OphRadioGroup,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import React from 'react';

import { ClearSelectionIcon } from '@/src/components/ClearSelectionIcon';
import { IconButton } from '@/src/components/IconButton';
import { OphRadioOption } from '@/src/lib/types/common';

interface OphRadioGroupWithClearProps<T extends string> {
  label?: string;
  labelId: string | undefined;
  options: Array<OphRadioOption<T>>;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  showClearButton?: boolean;
  clearButtonPlacement?: 'header' | 'inline';
  row?: boolean;
  disabled?: boolean;
  error?: boolean;
  sx?: object;
  'data-testid'?: string;
  labelVariant?: 'h2' | 'h3' | 'h4' | 'label' | 'body1';
  inlineLabelMinWidth?: number | string;
}

export const OphRadioGroupWithClear = <T extends string>({
  label,
  labelId,
  options,
  value,
  onChange,
  onClear,
  showClearButton,
  clearButtonPlacement = 'header',
  row = true,
  disabled = false,
  error = false,
  sx,
  'data-testid': dataTestId,
  labelVariant = 'h4',
  inlineLabelMinWidth = 150,
}: OphRadioGroupWithClearProps<T>) => {
  const shouldShowClearButton = showClearButton ?? value !== '';

  const clearButton = shouldShowClearButton && (
    <IconButton
      data-testid={`${dataTestId}-clear-button`}
      onClick={onClear}
      disabled={disabled}
      aria-label={label ? `Tyhjennä valinta: ${label}` : 'Tyhjennä valinta'}
    >
      <ClearSelectionIcon />
    </IconButton>
  );

  const inlineSx = {
    ...sx,
    paddingLeft: 0,
    '& .MuiFormGroup-root': {
      paddingLeft: 0,
    },
    '& .MuiRadioGroup-root': {
      paddingLeft: 0,
    },
  };

  const radioGroup = (
    <OphRadioGroup
      labelId={labelId}
      data-testid={dataTestId}
      sx={clearButtonPlacement === 'inline' ? inlineSx : sx}
      options={options}
      row={row}
      value={value}
      onChange={onChange}
      disabled={disabled}
      error={error}
    />
  );

  if (clearButtonPlacement === 'inline') {
    return (
      <Stack direction="row" alignItems="center" spacing={0}>
        {label && (
          <OphTypography
            variant={labelVariant}
            sx={{ minWidth: inlineLabelMinWidth }}
          >
            {label}
          </OphTypography>
        )}
        <Box
          sx={{
            width: 40,
            minWidth: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {shouldShowClearButton && clearButton}
        </Box>
        {radioGroup}
      </Stack>
    );
  }

  return (
    <Stack direction="column" spacing={0}>
      <Stack direction="row" alignItems="center">
        {label && (
          <OphTypography variant={labelVariant} id={labelId}>
            {label}
          </OphTypography>
        )}
        {clearButton}
      </Stack>
      {radioGroup}
    </Stack>
  );
};
