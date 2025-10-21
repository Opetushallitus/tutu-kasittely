'use client';

import React, { ChangeEvent } from 'react';
import { Stack } from '@mui/material';
import {
  OphRadioGroupFormField,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { IconButton } from '@/src/components/IconButton';
import { ClearSelectionIcon } from '@/src/components/ClearSelectionIcon';
import { OphRadioOption } from '@/src/lib/types/common';

type RadioGroupFormFieldChangeEventHandler = {
  (event: React.FormEvent<HTMLDivElement>): void;
  (event: ChangeEvent<HTMLInputElement>, value: string): void;
};

interface OphRadioGroupFormFieldWithClearProps<T extends string> {
  label: string;
  options: Array<OphRadioOption<T>>;
  value: string;
  onChange: RadioGroupFormFieldChangeEventHandler;
  onClear: () => void;
  showClearButton?: boolean;
  row?: boolean;
  disabled?: boolean;
  error?: boolean;
  required?: boolean;
  helperText?: string;
  errorMessage?: string;
  sx?: object;
  'data-testid'?: string;
}

export const OphRadioGroupFormFieldWithClear = <T extends string>({
  label,
  options,
  value,
  onChange,
  onClear,
  showClearButton,
  row = true,
  disabled = false,
  error = false,
  required = false,
  helperText,
  errorMessage,
  sx,
  'data-testid': dataTestId,
}: OphRadioGroupFormFieldWithClearProps<T>) => {
  const shouldShowClearButton =
    showClearButton !== undefined ? showClearButton : value !== '';

  const labelId = `${dataTestId}-label`;

  return (
    <Stack direction="column" spacing={0}>
      <Stack direction="row" alignItems="center">
        {label && (
          <OphTypography variant="label" id={labelId}>
            {label}
          </OphTypography>
        )}
        {shouldShowClearButton && (
          <IconButton
            data-testid={`${dataTestId}-clear-button`}
            onClick={onClear}
            disabled={disabled}
            aria-label={
              label ? `Tyhjennä valinta: ${label}` : 'Tyhjennä valinta'
            }
          >
            <ClearSelectionIcon />
          </IconButton>
        )}
      </Stack>
      <OphRadioGroupFormField
        label=""
        data-testid={dataTestId}
        sx={{ ...sx, '& legend': { display: 'none' } }}
        options={options}
        row={row}
        value={value}
        onChange={onChange}
        disabled={disabled}
        error={error}
        required={required}
        helperText={helperText}
        errorMessage={errorMessage}
        aria-labelledby={labelId}
      />
    </Stack>
  );
};
