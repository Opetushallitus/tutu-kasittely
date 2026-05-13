'use client';

import Close from '@mui/icons-material/Close';
import {
  Autocomplete,
  Box,
  Chip,
  IconButton,
  ListSubheader,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import {
  ophColors,
  OphFormFieldWrapper,
  OphTypography,
} from '@opetushallitus/oph-design-system';

import { TreeOption } from '@/src/lib/localization/translationUtils';

type BaseProps = {
  label: string;
  options: TreeOption[];
  'data-testid'?: string;
  placeholder?: string;
  autocomplete?: boolean;
};

type SingleProps = BaseProps & {
  multiple?: false;
  value?: string;
  onChange: (value: string) => void;
};

type MultiProps = BaseProps & {
  multiple: true;
  value?: string[];
  onChange: (values: string[]) => void;
};

const renderOptionsRecursively = (
  options: TreeOption[],
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

const parseValueLabel = (value: string) => value.split('_').join(', ');

type FlatOption = { value: string; label: string; group?: string };

const flattenToLeaves = (
  options: TreeOption[],
  parentLabel?: string,
): FlatOption[] =>
  options.flatMap((option) =>
    option.children?.length
      ? flattenToLeaves(option.children, option.label)
      : [{ value: option.value, label: option.label, group: parentLabel }],
  );

const SELECT_MENU_PROPS = {
  anchorOrigin: { vertical: 'bottom' as const, horizontal: 'left' as const },
  transformOrigin: { vertical: 'top' as const, horizontal: 'left' as const },
  PaperProps: {
    sx: {
      maxHeight: 'min(480px, calc(60vh - 100px))',
      overflowY: 'auto',
    },
  },
};

const SELECT_SX = {
  width: '100%',
  // Match OphSelectMultiple focus border style
  '& .MuiSelect-select:focus-visible': { outline: 'none', outlineOffset: 0 },
  '&:has(.MuiSelect-select:focus-visible)': {
    outline: '2px solid #000000',
    outlineOffset: '1px',
    zIndex: 9999,
  },
};

/**
 * OphSelectMultiplea vastaava dropdown sisäkkäisillä ryhmittelyillä.
 * Single-select konfiguroitavissa, sekä autocomplete+multiple
 * flatillä option-listalle (ilman ryhmittelyjä).
 */
export const SelectTreeDropdown = (props: SingleProps | MultiProps) => {
  const {
    label,
    options,
    'data-testid': dataTestId,
    placeholder,
    autocomplete,
    multiple,
  } = props;

  // Close as possible to the same component but with autocomplete
  if (autocomplete) {
    const flat = flattenToLeaves(options);
    if (flat.some((o) => o.group)) {
      throw new Error(
        'SelectTreeDropdown: autocomplete does not support grouped (tree) options',
      );
    }

    const currentValues = ([] as string[]).concat(props.value ?? []);

    const selectedOptions = flat.filter((o) => currentValues.includes(o.value));

    if (!multiple) {
      throw new Error('SelectTreeDropdown: autocomplete must be multiple');
    }

    return (
      <OphFormFieldWrapper
        label={label}
        sx={{ width: '100%' }}
        renderInput={() => {
          const clearIndicatorSlotProps = {
            sx: {
              color: ophColors.black,
              visibility: selectedOptions.length > 0 ? 'visible' : 'hidden',
              '& svg': { fontSize: '1.5rem' },
            },
          };

          return (
            <Autocomplete<FlatOption, true>
              multiple
              disableCloseOnSelect
              options={flat}
              getOptionLabel={(o) => o.label}
              isOptionEqualToValue={(o, v) => o.value === v.value}
              value={selectedOptions}
              onChange={(_, newValues) =>
                props.onChange(newValues.map((o) => o.value))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    selectedOptions.length === 0 ? placeholder : undefined
                  }
                />
              )}
              renderTags={(tagValues, getTagProps) =>
                tagValues.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      {...tagProps}
                      label={option.label}
                      size="small"
                      deleteIcon={<Close />}
                      sx={{
                        borderRadius: 0,
                        backgroundColor: ophColors.grey200,
                        '& .MuiChip-deleteIcon': { color: ophColors.black },
                      }}
                    />
                  );
                })
              }
              data-testid={dataTestId}
              slotProps={{ clearIndicator: clearIndicatorSlotProps }}
            />
          );
        }}
      />
    );
  }

  const renderSelectValue = (selected: string | string[]) => {
    const vals = ([] as string[]).concat(selected).filter(Boolean);

    if (vals.length === 0) {
      return (
        <Box component="span" sx={{ color: 'text.disabled' }}>
          {placeholder}
        </Box>
      );
    }
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {vals.map((val) => (
          <Chip
            key={val}
            label={parseValueLabel(val)}
            size="small"
            deleteIcon={<Close />}
            onDelete={() => {
              if (multiple) {
                props.onChange((props.value ?? []).filter((v) => v !== val));
              } else {
                (props as SingleProps).onChange('');
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ))}
      </Box>
    );
  };

  const selectValue = multiple
    ? ((props as MultiProps).value ?? [])
    : ((props as SingleProps).value ?? '');
  const hasValues = ([] as string[]).concat(props.value ?? []).length > 0;

  const handleClearAll = () => {
    if (multiple) {
      (props as MultiProps).onChange([]);
    } else {
      (props as SingleProps).onChange('');
    }
  };

  return (
    <OphFormFieldWrapper
      label={label}
      sx={{ width: '100%' }}
      renderInput={() => (
        <Box sx={{ position: 'relative' }}>
          <Select
            multiple={multiple}
            displayEmpty
            data-testid={dataTestId}
            value={selectValue as never}
            onChange={(e) => {
              if (multiple) {
                (props as MultiProps).onChange(e.target.value as string[]);
              } else {
                (props as SingleProps).onChange(e.target.value as string);
              }
            }}
            MenuProps={SELECT_MENU_PROPS}
            sx={SELECT_SX}
            renderValue={renderSelectValue}
          >
            {renderOptionsRecursively(options)}
          </Select>
          {hasValues && (
            <IconButton
              size="small"
              aria-label="clear"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                handleClearAll();
              }}
              sx={{
                position: 'absolute',
                right: 32,
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '4px',
                color: ophColors.black,
              }}
            >
              <Close />
            </IconButton>
          )}
        </Box>
      )}
    />
  );
};
