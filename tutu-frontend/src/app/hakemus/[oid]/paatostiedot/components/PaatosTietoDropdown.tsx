import {
  OphFormFieldWrapper,
  OphTypography,
} from '@opetushallitus/oph-design-system';
import { ListSubheader, MenuItem, Select } from '@mui/material';
import React from 'react';
import { PaatosTietoDropdownOption } from '@/src/app/hakemus/[oid]/paatostiedot/paatostietoUtils';

const renderOptionsRecursively = (
  options: PaatosTietoDropdownOption[],
  level: number = 1,
): React.ReactNode[] => {
  return options.flatMap((option) => {
    const isTopLevel = option.children && option.children.length > 0;
    if (isTopLevel) {
      return [
        <ListSubheader
          key={`header-${option.value}`}
          sx={{ paddingLeft: level }}
        >
          <OphTypography sx={{ paddingLeft: level + 1 }} variant="h5">
            {option.label}
          </OphTypography>
        </ListSubheader>,
        ...renderOptionsRecursively(option.children!, level + 1),
      ];
    }

    return (
      <MenuItem key={option.value} value={option.value}>
        <OphTypography sx={{ paddingLeft: level === 1 ? level : level + 1 }}>
          {option.label}
        </OphTypography>
      </MenuItem>
    );
  });
};

const parseValueWithPath = (value: string | null) => {
  if (!value) return '';
  return value.split('_').join(', ');
};

export const PaatosTietoDropdown = ({
  label,
  value,
  options,
  dataTestId,
  updateAction,
}: {
  label: string;
  value?: string;
  options: PaatosTietoDropdownOption[];
  dataTestId?: string;
  updateAction: (newValue: string) => void;
}) => {
  return (
    <OphFormFieldWrapper
      label={label}
      sx={{ width: '100%' }}
      renderInput={() => (
        <Select
          sx={{ width: '100%' }}
          data-testid={dataTestId}
          value={value || ''}
          onChange={(e) => updateAction(e.target.value)}
          renderValue={(renderedVal: string | null) =>
            parseValueWithPath(renderedVal)
          }
          displayEmpty
        >
          {renderOptionsRecursively(options)}
        </Select>
      )}
    />
  );
};
